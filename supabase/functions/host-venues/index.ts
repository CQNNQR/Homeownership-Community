// Supabase Edge Function: host-venues
// Purpose: list venues owned / managed by the calling host user.
// CORS is handled by the shared helper in _shared/cors.ts.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  handlePreflight,
  jsonResponse,
} from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

interface AuthContext {
  userId: string;
  email: string | null;
  role: string;
  client: ReturnType<typeof createClient>;
}

async function getAuthContext(req: Request): Promise<
  | { ok: true; ctx: AuthContext }
  | { ok: false; status: number; message: string }
> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, message: "Missing bearer token" };
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      status: 500,
      message: "Server is missing SUPABASE_URL / SUPABASE_ANON_KEY",
    };
  }

  // Use the user's JWT so RLS scopes queries to their own venues.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return { ok: false, status: 401, message: "Invalid or expired session" };
  }

  const role = (user.app_metadata as Record<string, unknown> | null)?.role as
    | string
    | undefined;

  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email ?? null,
      role: role ?? "authenticated",
      client: userClient,
    },
  };
}

async function handleList(ctx: AuthContext, req: Request) {
  // We try the most likely table names, scoped to this host.
  const candidates = [
    { table: "venues", owner: "host_id" },
    { table: "venues", owner: "owner_id" },
    { table: "venues", owner: "user_id" },
    { table: "host_venues", owner: "host_id" },
    { table: "host_venues", owner: "user_id" },
  ];

  for (const c of candidates) {
    const { data, error } = await ctx.client
      .from(c.table)
      .select("*")
      .eq(c.owner, ctx.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) return jsonResponse(req, { ok: true, data: data ?? [] });
    if (error.code !== "PGRST205" && error.code !== "42P01" && error.code !== "42703") {
      return jsonResponse(req, { ok: false, error: error.message }, { status: 500 });
    }
    // 42703 = undefined column — try the next owner column.
  }
  // Schema unknown — return empty array so the page renders.
  return jsonResponse(req, { ok: true, data: [] });
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  const auth = await getAuthContext(req);
  if (auth.ok === false) {
    return jsonResponse(req, { ok: false, error: auth.message }, { status: auth.status });
  }
  // Any authenticated user is allowed; admin users get a wider scope inside the query.
  if (!auth.ctx.userId) {
    return jsonResponse(req, { ok: false, error: "No user" }, { status: 401 });
  }

  try {
    if (req.method === "GET") return await handleList(auth.ctx, req);
    return jsonResponse(
      req,
      { ok: false, error: `Method ${req.method} not allowed` },
      { status: 405, headers: { Allow: "GET, OPTIONS" } },
    );
  } catch (err) {
    return jsonResponse(
      req,
      { ok: false, error: (err as Error).message ?? "Internal error" },
      { status: 500 },
    );
  }
});

export { corsHeaders };
