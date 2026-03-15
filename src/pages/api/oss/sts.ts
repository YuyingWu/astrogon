import type { APIRoute } from "astro";

export const prerender = false;

type RuntimeEnv = Record<string, string | undefined>;

type AssumeRoleCredentials = {
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration: string;
};

const encoder = new TextEncoder();

function getEnv(context: Parameters<APIRoute>[0]): RuntimeEnv {
  const runtimeEnv = (context.locals as { runtime?: { env?: RuntimeEnv } }).runtime?.env ?? {};
  return new Proxy(runtimeEnv, {
    get(target, prop: string) {
      return target[prop] ?? (import.meta.env[prop] as string | undefined);
    },
  });
}

function getRequestOrigin(requestUrl: string): string {
  return new URL(requestUrl).origin;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

async function hmacSha1Base64(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64(new Uint8Array(signature));
}

async function sha1Hex(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-1", encoder.encode(value));
  return toHex(new Uint8Array(hash));
}

function canonicalizedQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");
}

async function signRpcRequest(params: Record<string, string>, accessKeySecret: string): Promise<string> {
  const query = canonicalizedQuery(params);
  const stringToSign = `GET&${percentEncode("/")}&${percentEncode(query)}`;
  const signature = await hmacSha1Base64(`${accessKeySecret}&`, stringToSign);
  return `${query}&Signature=${percentEncode(signature)}`;
}

function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return cleaned || "asset.bin";
}

function makeObjectKey(prefix: string, filename: string): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const keyPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const safeName = sanitizeFilename(filename);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${keyPrefix}/${yyyy}/${mm}/${dd}/${random}-${safeName}`;
}

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function assumeRole(context: Parameters<APIRoute>[0], env: RuntimeEnv, prefix: string): Promise<AssumeRoleCredentials> {
  const accessKeyId = env.ALIYUN_ACCESS_KEY_ID ?? "";
  const accessKeySecret = env.ALIYUN_ACCESS_KEY_SECRET ?? "";
  const roleArn = env.ALIYUN_STS_ROLE_ARN ?? "";
  const durationSeconds = Number(env.ALIYUN_STS_DURATION_SECONDS ?? "1800");
  const roleSessionName = `decap-${Date.now()}`;

  const rolePolicy = JSON.stringify({
    Version: "1",
    Statement: [
      {
        Effect: "Allow",
        Action: ["oss:PutObject"],
        Resource: [`acs:oss:*:*:${env.ALIYUN_OSS_BUCKET}/${prefix}/*`],
      },
    ],
  });

  const params: Record<string, string> = {
    Action: "AssumeRole",
    Format: "JSON",
    Version: "2015-04-01",
    AccessKeyId: accessKeyId,
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: crypto.randomUUID(),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    RoleArn: roleArn,
    RoleSessionName: roleSessionName,
    DurationSeconds: String(Math.max(900, Math.min(3600, durationSeconds))),
    Policy: rolePolicy,
  };

  const signedQuery = await signRpcRequest(params, accessKeySecret);
  const url = `https://sts.aliyuncs.com/?${signedQuery}`;
  const response = await fetch(url, { method: "GET" });
  const payload = (await response.json()) as {
    Credentials?: AssumeRoleCredentials;
    Message?: string;
    Code?: string;
  };

  if (!response.ok || !payload.Credentials) {
    throw new Error(payload.Message || payload.Code || "AssumeRole failed");
  }

  return payload.Credentials;
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-admin-upload-token",
      "access-control-max-age": "86400",
    },
  });

export const GET: APIRoute = async () =>
  jsonResponse(405, {
    error: "Method not allowed. Use POST.",
  });

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const request = context.request;
  const requestOrigin = getRequestOrigin(request.url);
  const originHeader = request.headers.get("origin");

  if (originHeader && originHeader !== requestOrigin) {
    return jsonResponse(403, { error: "Invalid origin." });
  }

  const uploadToken = env.ADMIN_UPLOAD_TOKEN ?? "";
  if (uploadToken) {
    const tokenFromRequest = request.headers.get("x-admin-upload-token") ?? "";
    if (tokenFromRequest !== uploadToken) {
      return jsonResponse(401, { error: "Invalid upload token." });
    }
  }

  const requiredKeys = [
    "ALIYUN_ACCESS_KEY_ID",
    "ALIYUN_ACCESS_KEY_SECRET",
    "ALIYUN_STS_ROLE_ARN",
    "ALIYUN_OSS_BUCKET",
    "ALIYUN_OSS_ENDPOINT",
  ] as const;

  const missing = requiredKeys.filter((key) => !env[key]);
  if (missing.length > 0) {
    return jsonResponse(500, {
      error: `Missing required env vars: ${missing.join(", ")}`,
    });
  }

  let body: { filename?: string; contentType?: string; size?: number };
  try {
    body = (await request.json()) as { filename?: string; contentType?: string; size?: number };
  } catch {
    return jsonResponse(400, { error: "Request body must be JSON." });
  }

  const filename = (body.filename ?? "").trim();
  const contentType = (body.contentType ?? "").trim().toLowerCase();
  const size = Number(body.size ?? 0);

  if (!filename) return jsonResponse(400, { error: "filename is required." });
  if (!contentType.startsWith("image/")) return jsonResponse(400, { error: "Only image files are allowed." });

  const maxSize = Number(env.ALIYUN_OSS_MAX_FILE_SIZE ?? `${10 * 1024 * 1024}`);
  if (!Number.isFinite(size) || size <= 0 || size > maxSize) {
    return jsonResponse(400, { error: `Invalid file size. Max allowed is ${maxSize} bytes.` });
  }

  const keyPrefix = (env.ALIYUN_OSS_PREFIX ?? "xx").replace(/^\/+|\/+$/g, "");
  const objectKey = makeObjectKey(keyPrefix, filename);

  let credentials: AssumeRoleCredentials;
  try {
    credentials = await assumeRole(context, env, keyPrefix);
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Failed to request STS credentials.",
    });
  }

  const policyExpiration = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const policy = {
    expiration: policyExpiration,
    conditions: [
      ["content-length-range", 1, maxSize],
      { bucket: env.ALIYUN_OSS_BUCKET },
      ["starts-with", "$key", `${keyPrefix}/`],
      ["starts-with", "$Content-Type", "image/"],
    ],
  };

  const policyBase64 = btoa(JSON.stringify(policy));
  const signature = await hmacSha1Base64(credentials.AccessKeySecret, policyBase64);
  const endpoint = (env.ALIYUN_OSS_ENDPOINT ?? "").replace(/^https?:\/\//, "");
  const uploadHost = `https://${env.ALIYUN_OSS_BUCKET}.${endpoint}`;
  const publicBase = (env.ALIYUN_OSS_PUBLIC_BASE_URL ?? uploadHost).replace(/\/+$/, "");
  const publicUrl = `${publicBase}/${objectKey}`;
  const etagHint = await sha1Hex(publicUrl).then((hash) => hash.slice(0, 16));

  return jsonResponse(200, {
    upload: {
      host: uploadHost,
      method: "POST",
      fields: {
        key: objectKey,
        policy: policyBase64,
        OSSAccessKeyId: credentials.AccessKeyId,
        Signature: signature,
        "x-oss-security-token": credentials.SecurityToken,
        "Content-Type": contentType,
        success_action_status: "200",
      },
      url: publicUrl,
    },
    asset: {
      key: objectKey,
      url: publicUrl,
      etagHint,
      expiresAt: credentials.Expiration,
    },
  });
};
