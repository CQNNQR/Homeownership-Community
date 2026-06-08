// Shared CORS helper for Supabase Edge Functions.
// Production origin: https://www.crossgage.com (seen in browser logs).
// We also allow the common local-dev hosts so dev/preview never breaks.

export const ALLOWED_ORIGINS = [
  "https://www.crossgage.com",
  "https://crossgage.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
] as const;

export type AllowedOrigin = (typeof ALLOWED_ORIGINS)[number];

export const DEFAULT_ORIGIN: AllowedOrigin = "https://www.crossgage.com";

/**
 * Pick the right Access-Control-Allow-Origin value for an incoming request.
 * Echoes the Origin header if it matches our allow-list, otherwise falls back
 * to the production origin. This is safer than always returning "*" when
 * credentials/Authorization are involved.
 */
export function resolveOrigin(req: Request): string {
  const incoming = req.headers.get("Origin");
  if (incoming && (ALLOWED_ORIGINS as readonly string[]).includes(incoming)) {
    return incoming;
  }
  return DEFAULT_ORIGIN;
}

/**
 * Build the full set of CORS response headers for a given request.
 * Keep these in one place so every function returns the same headers on
 * success, error, and preflight paths.
 */
export function corsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": resolveOrigin(req),
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-auth, x-requested-with",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/**
 * Handle a CORS preflight (OPTIONS) request.
 * Returns a 204 Response with the CORS headers attached, or null if the
 * caller should handle OPTIONS itself.
 */
export function handlePreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

/**
 * Wrap a Response (or a value to be JSON-encoded) so that the CORS headers
 * are always attached. Useful for any code path that returns early with
 * an error or a stub.
 */
export function withCors(req: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(req))) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function jsonResponse(
  req: Request,
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(corsHeaders(req))) {
    headers.set(k, v);
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}
