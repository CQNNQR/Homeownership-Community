import { NextResponse } from 'next/server'
import { Resend } from 'resend'

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
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehomeownershipcommunity.com'

    const safeName = escapeHtml(String(name))
    const safeEmail = escapeHtml(String(email))
    const safePhone = phone ? escapeHtml(String(phone)) : null
    const safeSubject = escapeHtml(String(subject))
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>')

    const phoneRow = safePhone
      ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:bold;">Phone</td><td style="padding:4px 0;">${safePhone}</td></tr>`
      : ''

    const { data, error } = await resend.emails.send({
      from: 'The Homeownership Community <onboarding@resend.dev>',
      to: 'brandon@hocmortgage.com',
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
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Contact error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
