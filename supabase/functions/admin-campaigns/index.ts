// Supabase Edge Function: admin-campaigns
// Purpose: read / mutate campaign records (used by the campaigns detail page).
// CORS is handled by the shared helper in _shared/cors.ts.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  handlePreflight,
  jsonResponse,
} from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

  const client = SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : userClient;

  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email ?? null,
      role: role ?? "authenticated",
      client,
    },
  };
}

async function readJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function handleList(ctx: AuthContext, req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const candidates = ["campaigns", "campaign", "promotions"];

  if (id) {
    for (const table of candidates) {
      const { data, error } = await ctx.client
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error) {
        return jsonResponse(req, { ok: true, data });
      }
      if (error.code !== "PGRST205" && error.code !== "42P01") {
        return jsonResponse(req, { ok: false, error: error.message }, { status: 500 });
      }
    }
    return jsonResponse(req, { ok: true, data: null });
  }

  for (const table of candidates) {
    const { data, error } = await ctx.client
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) return jsonResponse(req, { ok: true, data: data ?? [] });
    if (error.code !== "PGRST205" && error.code !== "42P01") {
      return jsonResponse(req, { ok: false, error: error.message }, { status: 500 });
    }
  }
  return jsonResponse(req, { ok: true, data: [] });
}

async function handleCreate(ctx: AuthContext, req: Request) {
  const body = (await readJson(req)) ?? {};
  const candidates = ["campaigns", "campaign", "promotions"];
  for (const table of candidates) {
    const insert = { ...body, created_by: ctx.userId };
    const { data, error } = await ctx.client
      .from(table)
      .insert(insert)
      .select()
      .single();
    if (!error) return jsonResponse(req, { ok: true, data });
    if (error.code !== "PGRST205" && error.code !== "42P01") {
      return jsonResponse(req, { ok: false, error: error.message }, { status: 500 });
    }
  }
  return jsonResponse(req, { ok: true, stub: true });
}

async function handleUpdate(ctx: AuthContext, req: Request) {
  const body = (await readJson(req)) ?? {};
  const id = (body as Record<string, unknown>).id as string | undefined;
  if (!id) {
    return jsonResponse(req, { ok: false, error: "Missing id" }, { status: 400 });
  }
  const candidates = ["campaigns", "campaign", "promotions"];
  for (const table of candidates) {
    const { data, error } = await ctx.client
      .from(table)
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (!error) return jsonResponse(req, { ok: true, data });
    if (error.code !== "PGRST205" && error.code !== "42P01") {
      return jsonResponse(req, { ok: false, error: error.message }, { status: 500 });
    }
  }
  return jsonResponse(req, { ok: true, stub: true });
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  const auth = await getAuthContext(req);
  if (auth.ok === false) {
    return jsonResponse(req, { ok: false, error: auth.message }, { status: auth.status });
  }
  if (auth.ctx.role !== "admin") {
    return jsonResponse(
      req,
      { ok: false, error: "Admin role required" },
      { status: 403 },
    );
  }

  try {
    if (req.method === "GET") return await handleList(auth.ctx, req);
    if (req.method === "POST") return await handleCreate(auth.ctx, req);
    if (req.method === "PATCH" || req.method === "PUT") {
      return await handleUpdate(auth.ctx, req);
    }
    return jsonResponse(
      req,
      { ok: false, error: `Method ${req.method} not allowed` },
      { status: 405, headers: { Allow: "GET, POST, PUT, PATCH, OPTIONS" } },
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
