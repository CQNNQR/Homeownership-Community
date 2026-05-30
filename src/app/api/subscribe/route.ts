import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Read PDF files from public directory
    const guidesDir = join(process.cwd(), 'public', 'guides')

    let attachments: Array<{ filename: string; content: Buffer | string; type?: string }> = []

    try {
      const hocReiFaq = readFileSync(join(guidesDir, 'hoc-rei-faq.pdf'))
      const reiFaq = readFileSync(join(guidesDir, 'REI FAQ BrandonBeeDixon.pdf'))

      attachments = [
        { filename: 'HOC-Real-Estate-Investment-FAQ.pdf', content: hocReiFaq.toString('base64'), type: 'application/pdf' },
        { filename: 'REI-FAQ-BrandonBeeDixon.pdf', content: reiFaq.toString('base64'), type: 'application/pdf' },
      ]
    } catch (fileError) {
      console.error('Error reading PDF files:', fileError)
      // Continue without attachments - the email will still be sent with download links
    }

    // Send email with Resend
    const { data, error } = await resend.emails.send({
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

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Check your email for the guides!' })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
