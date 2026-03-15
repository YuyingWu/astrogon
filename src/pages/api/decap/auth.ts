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

function createJsonResponse(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const GET: APIRoute = async (context) => {
  const clientId = getEnv(context, "GITHUB_CLIENT_ID");
  const secret = getEnv(context, "DECAP_OAUTH_SECRET");
  const requestUrl = new URL(context.request.url);

  if (!clientId || !secret) {
    return createJsonResponse(500, {
      error: "Missing GITHUB_CLIENT_ID or DECAP_OAUTH_SECRET",
    });
  }

  const state = crypto.randomUUID().replace(/-/g, "");
  const stateSignature = await hmacSha256(secret, state);
  const redirectUri = new URL("/api/decap/callback", requestUrl.origin).toString();

  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("redirect_uri", redirectUri);
  githubUrl.searchParams.set("scope", "repo");
  githubUrl.searchParams.set("state", state);

  const secure = requestUrl.protocol === "https:";
  const cookie = [
    `${STATE_COOKIE}=${state}.${stateSignature}`,
    "Path=/api/decap",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=600",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(null, {
    status: 302,
    headers: {
      location: githubUrl.toString(),
      "set-cookie": cookie,
      "cache-control": "no-store",
    },
  });
};
