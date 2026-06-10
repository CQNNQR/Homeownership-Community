/**
 * Shared server-side API helpers.
 *
 * Goals (from the Backend Recovery Plan):
 *   - One response envelope for every admin endpoint:
 *       Success: { data, message? }
 *       Failure: { error: { code, message, details? } }
 *   - PATCH semantics: only supplied fields are written. PUT (the legacy
 *     "replace everything") remains supported for tables where the
 *     client always sends the full record, but PATCH is preferred.
 *   - Affected-row check: stale IDs return 404, never false success.
 *   - Structured server logging (request id, op, table, record id, error
 *     code, duration).
 *
 * These are intentionally small, dependency-free, and safe to import
 * from any route handler. They do not own the Supabase client; route
 * handlers continue to construct their own clients and pass rows into
 * `ok()` / `err()`.
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

// --------------------------------------------------------------------
// Response envelope
// --------------------------------------------------------------------

export interface ApiOk<T> {
  data: T
  message?: string
}

export interface ApiErr {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function ok<T>(data: T, message?: string, init?: ResponseInit): NextResponse {
  const body: ApiOk<T> = { data }
  if (message) body.message = message
  return NextResponse.json(body, init)
}

export function err(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  const body: ApiErr = { error: { code, message } }
  if (details !== undefined) body.error.details = details
  return NextResponse.json(body, { status })
}

// Canonical error codes used across endpoints.
export const ErrorCodes = {
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  Validation: 'validation',
  Conflict: 'conflict',
  RateLimited: 'rate_limited',
  Upstream: 'upstream_error',
  Internal: 'internal_error',
} as const

// Convenience constructors for the common cases.
export const badRequest = (message: string, details?: unknown) =>
  err(ErrorCodes.Validation, message, 400, details)
export const unauthorized = (message = 'Unauthorized') =>
  err(ErrorCodes.Unauthorized, message, 401)
export const forbidden = (message = 'Forbidden') =>
  err(ErrorCodes.Forbidden, message, 403)
export const notFound = (resource = 'Resource') =>
  err(ErrorCodes.NotFound, `${resource} not found`, 404)
export const conflict = (message: string) =>
  err(ErrorCodes.Conflict, message, 409)
export const rateLimited = (message = 'Too many requests') =>
  err(ErrorCodes.RateLimited, message, 429)
export const upstreamError = (message: string, details?: unknown) =>
  err(ErrorCodes.Upstream, message, 502, details)
export const internalError = (message = 'Internal error', details?: unknown) =>
  err(ErrorCodes.Internal, message, 500, details)

// --------------------------------------------------------------------
// PATCH / parsePartial
// --------------------------------------------------------------------

/**
 * Filter an arbitrary body to only the keys in `allowed`, dropping
 * undefined values so a PATCH only writes fields the client actually
 * sent. Returns both the patch object and the list of ignored keys for
 * caller logging.
 */
export function parsePartial<T extends Record<string, unknown>>(
  body: unknown,
  allowed: readonly (keyof T)[],
): { patch: Partial<T>; ignored: string[]; reason?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { patch: {}, ignored: [], reason: 'body-not-object' }
  }
  const allowedSet = new Set(allowed.map(String))
  const patch: Partial<T> = {}
  const ignored: string[] = []
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (!allowedSet.has(k)) { ignored.push(k); continue }
    if (v === undefined) continue
    ;(patch as Record<string, unknown>)[k] = v
  }
  return { patch, ignored }
}

// --------------------------------------------------------------------
// Affected-row check
// --------------------------------------------------------------------

/**
 * Wrap a Supabase update/delete that returns `{ data, error }`. If the
 * call succeeded but affected zero rows, return 404. The recovery plan
 * calls out that stale or incorrect IDs must not produce a false
 * success response.
 */
export function assertAffected<T extends { id?: unknown } | null | undefined>(
  data: T,
  error: { message: string; code?: string } | null,
  resource = 'Resource',
): { data: T; error: null } | { data: null; error: NextResponse } {
  if (error) {
    return { data: null, error: internalError(error.message, { code: error.code }) }
  }
  if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
    return { data: null, error: notFound(resource) }
  }
  return { data, error: null }
}

// --------------------------------------------------------------------
// Structured server logging
// --------------------------------------------------------------------

export interface ServerOpContext {
  requestId?: string
  op: string
  table: string
  recordId?: string | number
  userId?: string | null
  errorCode?: string
  durationMs?: number
  meta?: Record<string, unknown>
}

export function newRequestId(): string {
  return randomUUID()
}

export function logServerOp(ctx: ServerOpContext): void {
  const line = {
    type: 'server_op',
    ts: new Date().toISOString(),
    request_id: ctx.requestId ?? null,
    op: ctx.op,
    table: ctx.table,
    record_id: ctx.recordId ?? null,
    user_id: ctx.userId ?? null,
    error_code: ctx.errorCode ?? null,
    duration_ms: ctx.durationMs ?? null,
    meta: ctx.meta ?? null,
  }
  // Single-line JSON so the Vercel log viewer renders it as a row.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(line))
}

/**
 * Convenience: time an async operation, log success/failure with
 * the standard envelope, and return the duration for the caller.
 */
export async function withServerLog<T>(
  ctx: Omit<ServerOpContext, 'durationMs' | 'errorCode'>,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    logServerOp({ ...ctx, durationMs: Date.now() - start })
    return result
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown'
    logServerOp({ ...ctx, durationMs: Date.now() - start, errorCode: 'exception', meta: { ...(ctx.meta ?? {}), message } })
    throw e
  }
}
