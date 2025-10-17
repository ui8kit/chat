// Simple proxy for ChatKit web component script to avoid 3rd-party blocking
// Serves the script under same-origin at /api/chatkit.js

const CHATKIT_CDN_SRC = "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const upstream = await fetch(CHATKIT_CDN_SRC, {
      // Prevent caching issues between deploys
      headers: { "Cache-Control": "no-cache" },
    });
    const body = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", "text/javascript; charset=utf-8");
    // Short cache so subsequent loads are faster, but allow quick invalidation
    res.setHeader("Cache-Control", "public, max-age=300");
    res.end(body);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Failed to fetch ChatKit script");
  }
}


