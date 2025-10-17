// Vercel Serverless Function for ChatKit session creation
// Production counterpart to the Vite dev middleware

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";
const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const openaiApiKey = (process.env.VITE_OPENAI_API_KEY || "").trim();
  if (!openaiApiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing VITE_OPENAI_API_KEY environment variable" }));
    return;
  }

  const raw = await readBody(req);
  let parsed: any = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  const existing = getCookieValue(req.headers?.cookie, SESSION_COOKIE_NAME);
  const userId = existing || safeRandomUUID();
  const setCookie = existing ? null : serializeSessionCookie(userId);

  const resolvedWorkflowId =
    (parsed?.workflow?.id as string | undefined) ||
    (parsed?.workflowId as string | undefined) ||
    (process.env.VITE_CHATKIT_WORKFLOW_ID || process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || "").trim();

  if (!resolvedWorkflowId) {
    res.statusCode = 400;
    if (setCookie) res.setHeader("Set-Cookie", setCookie);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing workflow id" }));
    return;
  }

  const apiBase = process.env.CHATKIT_API_BASE || DEFAULT_CHATKIT_BASE;
  const url = `${apiBase}/v1/chatkit/sessions`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: resolvedWorkflowId },
        user: userId,
        chatkit_configuration: {
          file_upload: {
            enabled: Boolean(parsed?.chatkit_configuration?.file_upload?.enabled),
          },
        },
      }),
    });

    const text = await upstream.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!upstream.ok) {
      const upstreamError = extractUpstreamError(json);
      res.statusCode = upstream.status;
      if (setCookie) res.setHeader("Set-Cookie", setCookie);
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: upstreamError || `Failed to create session: ${upstream.statusText}`,
          details: json || undefined,
        })
      );
      return;
    }

    const client_secret = json?.client_secret ?? null;
    const expires_after = json?.expires_after ?? null;
    res.statusCode = 200;
    if (setCookie) res.setHeader("Set-Cookie", setCookie);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ client_secret, expires_after }));
  } catch (err) {
    res.statusCode = 500;
    if (setCookie) res.setHeader("Set-Cookie", setCookie);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Unexpected error" }));
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", () => resolve(""));
  });
}

function getCookieValue(cookieHeader: string | undefined | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.split("=");
    if (!rawName || rest.length === 0) continue;
    if (rawName.trim() === name) return rest.join("=").trim();
  }
  return null;
}

function serializeSessionCookie(value: string): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${SESSION_COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }
  return attributes.join("; ");
}

function safeRandomUUID(): string {
  try {
    // @ts-ignore optional global in Node >= 18
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      // @ts-ignore
      return globalThis.crypto.randomUUID();
    }
  } catch {}
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function extractUpstreamError(payload: any): string | null {
  if (!payload) return null;
  const error = payload.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && typeof (error as any).message === "string") {
    return (error as any).message as string;
  }
  const details = payload.details;
  if (typeof details === "string") return details;
  if (details && typeof details === "object" && typeof (details as any).error !== "undefined") {
    const nested = (details as any).error;
    if (typeof nested === "string") return nested;
    if (nested && typeof nested === "object" && typeof (nested as any).message === "string") {
      return (nested as any).message as string;
    }
  }
  if (typeof payload.message === "string") return payload.message as string;
  return null;
}


