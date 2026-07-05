/**
 * POST /api/subscribe
 *
 * Compatibility wrapper. New callers should hit /api/leads directly;
 * this route exists so the existing Resources-page form (and any
 * third-party integration still pointing here) keeps working.
 *
 * Behavior:
 *   - Validates email
 *   - Sends the welcome email with PDF guides (the original behavior)
 *   - Persists the subscriber via /api/leads (which enqueues a Zapier
 *     job and attempts immediate delivery server-side)
 *   - 200 OK on success regardless of Zapier outcome
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createLead } from '@/lib/leads'
import { badRequest, newRequestId, withServerLog } from '@/lib/api'

export async function POST(request: Request) {
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'subscribe_compat', table: 'subscribers' },
    async () => {
      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
      const { email, firstName, lastName, phone } = body as {
        email?: string; firstName?: string; lastName?: string; phone?: string;
      }
      if (!email || !email.includes('@')) return badRequest('Valid email required')

      // Persist + enqueue delivery (the canonical lead pipeline).
      // We do not await failure — even if this throws, the email
      // can still go out below.
      let delivery: { ok: boolean; skipped: boolean; error?: string } | null = null
      try {
        const result = await createLead({
          email,
          firstName,
          lastName,
          phone,
          source: 'resources-pdf-download',
        })
        delivery = result.delivery
      } catch {
        delivery = { ok: false, skipped: false, error: 'lead persistence failed' }
      }

      // Best-effort: send the welcome email with PDF guides.
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const guidesDir = join(process.cwd(), 'public', 'guides')
        const attachments: Array<{ filename: string; content: string; type?: string }> = []
        try {
          if (existsSync(join(guidesDir, 'hoc-rei-faq.pdf'))) {
            const buf = readFileSync(join(guidesDir, 'hoc-rei-faq.pdf'))
            attachments.push({
              filename: 'HOC-Real-Estate-Investment-FAQ.pdf',
              content: buf.toString('base64'),
              type: 'application/pdf',
            })
          }
          if (existsSync(join(guidesDir, 'REI FAQ BrandonBeeDixon.pdf'))) {
            const buf = readFileSync(join(guidesDir, 'REI FAQ BrandonBeeDixon.pdf'))
            attachments.push({
              filename: 'REI-FAQ-BrandonBeeDixon.pdf',
              content: buf.toString('base64'),
              type: 'application/pdf',
            })
          }
          if (existsSync(join(guidesDir, 'Reverse Mortgage Guide BrandonBeeDixon.pdf'))) {
            const buf = readFileSync(join(guidesDir, 'Reverse Mortgage Guide BrandonBeeDixon.pdf'))
            attachments.push({
              filename: 'Reverse-Mortgage-Guide-BrandonBeeDixon.pdf',
              content: buf.toString('base64'),
              type: 'application/pdf',
            })
          }
        } catch {
          // Continue without attachments.
        }
        try {
          const resend = new Resend(apiKey)
          await resend.emails.send({
            from: 'The Homeownership Community <onboarding@resend.dev>',
            to: email,
            subject: 'Your Free Real Estate Investment Guides',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #A61C30;">Welcome to The Homeownership Community!</h1>
                <p>Thank you for subscribing! Your free guides are attached to this email:</p>
                <ul>
                  <li><strong>HOC Real Estate Investment FAQ</strong></li>
                  <li><strong>REI FAQ by Brandon Bee Dixon</strong></li>
                  <li><strong>Reverse Mortgage Guide</strong></li>
                </ul>
                <p>You can also download these guides anytime from our Resources page.</p>
                <p>Best regards,<br/>Brandon Bee Dixon</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #666; font-size: 12px;">
                  The Homeownership Community | We Create Owners<br/>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thehomeownershipcommunity.com'}">Visit Website</a>
                </p>
              </div>
            `,
            attachments,
          })
        } catch {
          // Email is best-effort; subscriber is already saved.
        }
      }

      return NextResponse.json({
        data: { success: true, delivery },
      })
    },
  )
}
