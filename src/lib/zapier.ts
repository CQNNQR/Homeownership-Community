import { createClient } from '@supabase/supabase-js'

export interface ZapierLeadPayload {
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  source: string
  created_at: string
  [key: string]: unknown
}

interface SettingsRow {
  key: string
  value: string | null
}

async function getZapierWebhookUrl(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'zapier_webhook_url')
    .maybeSingle<SettingsRow>()

  const value = data?.value?.trim()
  if (!value) return null
  if (!/^https?:\/\//i.test(value)) return null
  return value
}

export async function sendToZapier(payload: ZapierLeadPayload): Promise<{
  ok: boolean
  status?: number
  error?: string
  skipped?: boolean
}> {
  try {
    const webhookUrl = await getZapierWebhookUrl()
    if (!webhookUrl) {
      return { ok: true, skipped: true }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return { ok: false, status: response.status, error: text || `HTTP ${response.status}` }
    }

    return { ok: true, status: response.status }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error sending to Zapier',
    }
  }
}
