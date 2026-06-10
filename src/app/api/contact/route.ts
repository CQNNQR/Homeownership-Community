import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { badRequest, newRequestId, withServerLog } from '@/lib/api'

/**
 * Simple in-process rate limiter: track submissions per IP in a Map.
 * Production would use a shared store (Redis/Vercel KV); the recovery
 * plan calls out that this needs hardening, so we provide a single-
 * instance throttle that prevents the simplest abuse. The
 * LEAD_RATE_LIMIT_PER_HOUR env var lets us tune it.
 */
const RECENT_SUBMISSIONS = new Map<string, number[]>()
const DEFAULT_LIMIT_PER_HOUR = 20

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

function checkRate(ip: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const hourAgo = now - 60 * 60 * 1000
  const list = (RECENT_SUBMISSIONS.get(ip) || []).filter((t) => t > hourAgo)
  if (list.length >= limit) {
    RECENT_SUBMISSIONS.set(ip, list)
    return { allowed: false, remaining: 0 }
  }
  list.push(now)
  RECENT_SUBMISSIONS.set(ip, list)
  return { allowed: true, remaining: limit - list.length }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  const requestId = newRequestId()
  const ip = clientIp(request)
  const limit = Number(process.env.LEAD_RATE_LIMIT_PER_HOUR) || DEFAULT_LIMIT_PER_HOUR
  const rate = checkRate(ip, limit)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many submissions from this IP. Try again later.' } },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  return withServerLog(
    { requestId, op: 'contact_email', table: 'contact_submissions', meta: { ip } },
    async () => {
      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
      const { name, email, phone, subject, message } = body as {
        name?: string; email?: string; phone?: string; subject?: string; message?: string
      }
      if (!name || !email || !subject || !message) {
        return badRequest('Name, email, subject, and message are required')
      }
      if (!isValidEmail(email)) return badRequest('Valid email required')

      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { error: { code: 'upstream_error', message: 'Email service not configured' } },
          { status: 500 },
        )
      }
      const resend = new Resend(apiKey)
      const fromAddress = process.env.CONTACT_FROM_EMAIL || 'The Homeownership Community <onboarding@resend.dev>'
      const toAddress = process.env.CONTACT_TO_EMAIL || 'brandon@hocmortgage.com'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehomeownershipcommunity.com'

      const safeName = escapeHtml(String(name))
      const safeEmail = escapeHtml(String(email))
      const safePhone = phone ? escapeHtml(String(phone)) : null
      const safeSubject = escapeHtml(String(subject))
      const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>')

      const phoneRow = safePhone
        ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold;">Phone</td><td style="padding:4px 0;">${safePhone}</td></tr>`
        : ''

      const { error } = await resend.emails.send({
        from: fromAddress,
        to: toAddress,
        replyTo: email,
        subject: `Contact form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #A61C30; margin-bottom: 16px;">New Contact Form Submission</h1>
            <p style="color:#333;margin-bottom:16px;">You have received a new message from the contact form on <a href="${siteUrl}">${siteUrl}</a>.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold;width:120px;">Name</td><td style="padding:4px 0;">${safeName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold;">Email</td><td style="padding:4px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
              ${phoneRow}
              <tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold;">Subject</td><td style="padding:4px 0;">${safeSubject}</td></tr>
            </table>
            <h2 style="color:#A61C30;font-size:16px;margin-bottom:8px;">Message</h2>
            <div style="background:#F9F9F9;border-left:4px solid #A61C30;padding:16px;border-radius:4px;color:#333;line-height:1.6;">
              ${safeMessage}
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#666;font-size:12px;">Reply directly to this email to respond to ${safeName}.</p>
          </div>
        `,
      })

      if (error) {
        return NextResponse.json(
          { error: { code: 'upstream_error', message: 'Failed to send email', details: { provider: 'resend', message: error.message } } },
          { status: 502 },
        )
      }
      return NextResponse.json({ data: { success: true } })
    },
  )
}
