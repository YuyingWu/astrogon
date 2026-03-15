import type { APIRoute } from "astro";

export const prerender = false;

const STATE_COOKIE = "decap_oauth_state";
const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(new Uint8Array(signature));
}

function getEnv(context: Parameters<APIRoute>[0], name: string): string {
  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, string> } }).runtime?.env;
  return runtimeEnv?.[name] ?? (import.meta.env[name] as string | undefined) ?? "";
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = rest.join("=");
    return acc;
  }, {});
}

function escapeJsString(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildPopupResponse(kind: "success" | "error", payload: Record<string, unknown>) {
  const encodedPayload = escapeJsString(JSON.stringify(payload));
  const messagePrefix = `authorization:github:${kind}:`;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Decap Auth</title>
  </head>
  <body>
    <script>
      (function () {
        var payload = JSON.parse(\`${encodedPayload}\`);
        var sent = false;

        function send(targetOrigin) {
          if (!window.opener || sent) return;
          sent = true;
          window.opener.postMessage("${messagePrefix}" + JSON.stringify(payload), targetOrigin || "*");
          setTimeout(function () { window.close(); }, 150);
        }

        function receiveMessage(event) {
          send(event.origin);
        }

        window.addEventListener("message", receiveMessage, false);
        if (window.opener) {
          window.opener.postMessage("authorizing:github", "*");
        }
        setTimeout(function () { send("*"); }, 1200);
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": `${STATE_COOKIE}=; Path=/api/decap; Max-Age=0; HttpOnly; SameSite=Lax`,
    },
  });
}

export const GET: APIRoute = async (context) => {
  const clientId = getEnv(context, "GITHUB_CLIENT_ID");
  const clientSecret = getEnv(context, "GITHUB_CLIENT_SECRET");
  const secret = getEnv(context, "DECAP_OAUTH_SECRET");

  if (!clientId || !clientSecret || !secret) {
    return buildPopupResponse("error", {
      error: "Missing required GitHub OAuth env vars.",
    });
  }

  const requestUrl = new URL(context.request.url);
  const code = requestUrl.searchParams.get("code") ?? "";
  const state = requestUrl.searchParams.get("state") ?? "";

  if (!code || !state) {
    return buildPopupResponse("error", { error: "Missing code or state." });
  }

  const cookieMap = parseCookie(context.request.headers.get("cookie"));
  const cookieValue = cookieMap[STATE_COOKIE] ?? "";
  const [cookieState, cookieSignature] = cookieValue.split(".");
  const expectedSignature = await hmacSha256(secret, state);

  if (!cookieState || !cookieSignature || cookieState !== state || cookieSignature !== expectedSignature) {
    return buildPopupResponse("error", { error: "Invalid state." });
  }

  const tokenExchangeResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL("/api/decap/callback", requestUrl.origin).toString(),
      state,
    }),
  });

  const tokenPayload = (await tokenExchangeResponse.json()) as {
    access_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenExchangeResponse.ok || !tokenPayload.access_token) {
    return buildPopupResponse("error", {
      error: tokenPayload.error ?? "token_exchange_failed",
      error_description: tokenPayload.error_description ?? "GitHub token exchange failed.",
    });
  }

  return buildPopupResponse("success", {
    token: tokenPayload.access_token,
    provider: "github",
  });
};
