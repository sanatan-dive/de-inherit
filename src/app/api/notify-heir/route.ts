import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }
    
    const resend = new Resend(apiKey)
    const body = await request.json()
    const { heirEmail, heirName, ownerAddress, claimUrl } = body

    if (!heirEmail) {
      return NextResponse.json(
        { error: 'Heir email is required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'De-Inherit <notifications@de-inherit.app>',
      to: [heirEmail],
      subject: '🔐 You have received a digital inheritance',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; background: #050508; color: #e4e4e7; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 48px; }
            h1 { font-family: 'Space Grotesk', sans-serif; font-size: 28px; margin-bottom: 16px; }
            p { color: #71717a; line-height: 1.6; margin-bottom: 16px; }
            .cta { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f4f4f5, #d4d4d8); color: #18181b; border-radius: 16px; text-decoration: none; font-weight: 600; margin-top: 24px; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #52525b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You've Inherited Digital Assets</h1>
            <p>Dear ${heirName || 'Friend'},</p>
            <p>Someone you know has left you an encrypted digital inheritance. They set up a secure vault that has now been released to you.</p>
            <p>The vault was owned by wallet: <code>${ownerAddress}</code></p>
            <p>Click the button below to claim your inheritance. You don't need any cryptocurrency or technical knowledge—we'll guide you through the process.</p>
            <a href="${claimUrl || 'https://de-inherit.vercel.app/claim'}" class="cta">Claim Your Inheritance</a>
            <div class="footer">
              <p>This is an automated message from De-Inherit, a privacy-preserving digital inheritance platform.</p>
              <p>If you didn't expect this email, you can safely ignore it.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
