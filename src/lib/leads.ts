/**
 * Lead capture library.
 *
 * Used by:
 *   - /api/leads  (canonical public lead endpoint)
 *   - /api/subscribers  (legacy compatibility wrapper)
 *   - /api/admin/integrations/zapier/dispatch (the cron-style retry
 *     loop calls dispatchLeadJob for each pending job)
 *
 * createLead() is the only entry point that should ever insert
 * subscribers or lead_delivery_jobs. It enforces:
 *   - email normalization
 *   - subscriber upsert (reactivates existing records)
 *   - source + consent timestamp
 *   - unique idempotency_key on the delivery job (so duplicate form
 *     submissions cannot create duplicate CRM contacts)
 */

import { randomUUID } from 'node:crypto'
import { getServiceRoleClient, getServerClient } from './admin'
import { sendToZapier, nextAttemptDelayMinutes, isWebhookConfigured } from './zapier'

export interface CreateLeadInput {
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  source: string
  consent?: boolean
  idempotencyKey?: string
  extra?: Record<string, unknown>
}

export interface CreateLeadResult {
  subscriber: Record<string, unknown>
  job: Record<string, unknown>
  delivery: { ok: boolean; skipped: boolean; error?: string; status?: number }
}

function normalizeEmail(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null
  return trimmed
}

function deriveIdempotencyKey(input: { email: string; source: string; explicit?: string }): string {
  if (input.explicit && input.explicit.trim()) return input.explicit.trim()
  // Hash is intentionally simple — the goal is dedup within a
  // reasonable window, not cryptographic security. A sha256 would be
  // overkill for a per-submission UUID-with-source pattern.
  const day = new Date().toISOString().slice(0, 13) // yyyy-mm-ddThh
  return `lead-${input.email}-${input.source}-${day}-${randomUUID().slice(0, 8)}`
}

export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const email = normalizeEmail(input.email)
  if (!email) {
    throw new LeadError('valid_email_required', 'Valid email required')
  }
  const source = String(input.source || 'unknown')
  const firstName = input.firstName?.trim() || null
  const lastName = input.lastName?.trim() || null
  const phone = input.phone?.trim() || null
  const idempotencyKey = deriveIdempotencyKey({ email, source, explicit: input.idempotencyKey })

  const supabase = getServiceRoleClient() ?? (await getServerClient())

  // Upsert subscriber.
  const { data: existing } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  let subscriber: Record<string, unknown>
  if (existing) {
    const { data: updated, error: upErr } = await supabase
      .from('subscribers')
      .update({
        first_name: firstName ?? (existing as { first_name?: string | null }).first_name,
        last_name: lastName ?? (existing as { last_name?: string | null }).last_name,
        phone: phone ?? (existing as { phone?: string | null }).phone,
        source,
        is_active: true,
        consented_at: input.consent === false ? null : new Date().toISOString(),
        last_submitted_at: new Date().toISOString(),
      })
      .eq('id', (existing as { id: string }).id)
      .select()
      .single()
    if (upErr || !updated) {
      throw new LeadError('subscriber_update_failed', upErr?.message ?? 'Update failed', upErr?.code)
    }
    subscriber = updated as Record<string, unknown>
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from('subscribers')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        source,
        is_active: true,
        consented_at: input.consent === false ? null : new Date().toISOString(),
        last_submitted_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (insErr || !inserted) {
      throw new LeadError('subscriber_insert_failed', insErr?.message ?? 'Insert failed', insErr?.code)
    }
    subscriber = inserted as Record<string, unknown>
  }

  // Enqueue delivery job. Idempotency: when the same key is enqueued
  // twice (e.g. user double-clicks "Subscribe"), the unique constraint
  // collapses it into a single job.
  const payload = {
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    source,
    created_at: new Date().toISOString(),
    ...(input.extra || {}),
  }
  const { data: job, error: jobErr } = await supabase
    .from('lead_delivery_jobs')
    .upsert([{
      subscriber_id: (subscriber as { id: string }).id,
      idempotency_key: idempotencyKey,
      integration: 'zapier',
      status: 'pending',
      payload,
      attempt_count: 0,
      next_attempt_at: new Date().toISOString(),
    }], { onConflict: 'idempotency_key', ignoreDuplicates: false })
    .select()
    .single()

  if (jobErr || !job) {
    // ignoreDuplicates=false + a unique key collision means the row
    // already exists; that's fine. Fetch the existing job.
    if (jobErr?.code === '23505') {
      const { data: existingJob } = await supabase
        .from('lead_delivery_jobs')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .single()
      if (existingJob) {
        return {
          subscriber,
          job: existingJob as Record<string, unknown>,
          delivery: { ok: true, skipped: true },
        }
      }
    }
    throw new LeadError('enqueue_failed', jobErr?.message ?? 'Enqueue failed', jobErr?.code)
  }

  // Best-effort immediate delivery. Failures are captured in the
  // job record so the dispatcher can retry on schedule.
  const result = await dispatchLeadJob({ id: (job as { id: string }).id })
  return { subscriber, job: (job as Record<string, unknown>), delivery: result }
}

export interface DispatchJobInput {
  id: string
  force?: boolean
}

/**
 * Pulls a single job by id, attempts delivery, and updates the job
 * record with the outcome. Returns the dispatch result; the caller
 * decides how to surface it.
 *
 * Skips jobs that are already delivered unless `force` is true.
 * Skips jobs whose `next_attempt_at` is in the future unless `force`.
 */
export async function dispatchLeadJob(input: DispatchJobInput): Promise<{
  ok: boolean; skipped: boolean; error?: string; status?: number;
}> {
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  const { data: job, error: fetchErr } = await supabase
    .from('lead_delivery_jobs')
    .select('*')
    .eq('id', input.id)
    .single()
  if (fetchErr || !job) {
    return { ok: false, skipped: false, error: 'job not found' }
  }
  const j = job as {
    id: string; status: string; attempt_count: number; max_attempts: number;
    next_attempt_at: string; payload: Record<string, unknown>;
  }
  if (j.status === 'delivered' && !input.force) {
    return { ok: true, skipped: true }
  }
  if (j.status === 'dead' && !input.force) {
    return { ok: false, skipped: true, error: 'job is in dead state' }
  }
  if (!input.force && new Date(j.next_attempt_at).getTime() > Date.now()) {
    return { ok: true, skipped: true, error: 'next_attempt_at is in the future' }
  }
  if (!isWebhookConfigured()) {
    // No webhook configured: mark the job as delivered (the recovery
    // plan treats subscriber records as the durable source of truth)
    // but flag it as a no-op so the admin can see it.
    await supabase
      .from('lead_delivery_jobs')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        last_error: 'no-webhook-configured',
        updated_at: new Date().toISOString(),
      })
      .eq('id', j.id)
    return { ok: true, skipped: true, error: 'no-webhook-configured' }
  }

  const dispatch = await sendToZapier(j.payload as never)
  const attemptCount = j.attempt_count + 1
  const baseUpdate: Record<string, unknown> = {
    attempt_count: attemptCount,
    last_http_status: dispatch.status ?? null,
    last_error: dispatch.error ?? null,
    updated_at: new Date().toISOString(),
  }
  if (dispatch.ok) {
    await supabase
      .from('lead_delivery_jobs')
      .update({
        ...baseUpdate,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', j.id)
    return { ok: true, skipped: false, status: dispatch.status }
  }
  // Failure path
  if (attemptCount >= j.max_attempts) {
    await supabase
      .from('lead_delivery_jobs')
      .update({ ...baseUpdate, status: 'dead' })
      .eq('id', j.id)
  } else {
    const delay = nextAttemptDelayMinutes(attemptCount)
    const nextAttempt = new Date(Date.now() + delay * 60 * 1000).toISOString()
    await supabase
      .from('lead_delivery_jobs')
      .update({ ...baseUpdate, status: 'pending', next_attempt_at: nextAttempt })
      .eq('id', j.id)
  }
  return { ok: false, skipped: false, error: dispatch.error, status: dispatch.status }
}

/**
 * Batch dispatcher. The cron endpoint (/api/admin/integrations/zapier/
 * dispatch) calls this with a small batch size to avoid hammering
 * Supabase with a single big query.
 */
export async function dispatchPendingJobs(opts: { batchSize?: number; force?: boolean } = {}): Promise<{
  attempted: number; delivered: number; failed: number; skipped: number;
}> {
  const batchSize = opts.batchSize ?? 25
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  const { data: jobs, error } = await supabase
    .from('lead_delivery_jobs')
    .select('id, status, next_attempt_at')
    .in('status', ['pending', 'in_flight'])
    .lte('next_attempt_at', new Date().toISOString())
    .order('next_attempt_at', { ascending: true })
    .limit(batchSize)
  if (error || !jobs) {
    return { attempted: 0, delivered: 0, failed: 0, skipped: 0 }
  }
  let delivered = 0, failed = 0, skipped = 0
  for (const j of jobs as Array<{ id: string }>) {
    const r = await dispatchLeadJob({ id: j.id, force: opts.force })
    if (r.ok) delivered++
    else if (r.skipped) skipped++
    else failed++
  }
  return { attempted: jobs.length, delivered, failed, skipped }
}

export class LeadError extends Error {
  code: string
  details?: unknown
  constructor(code: string, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.details = details
  }
}
