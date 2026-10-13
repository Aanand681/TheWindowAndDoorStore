import nodemailer from 'nodemailer';

interface SendOtpResult {
  success: boolean;
  simulated?: boolean;
  error?: string;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<SendOtpResult> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"The Window & Door Store" <noreply@vwd.com>';

  // Check if SMTP is configured
  const hasSmtp = Boolean(host && user && pass);

  if (!hasSmtp) {
    console.log('\n========================================================');
    console.log('🔐 [ACCOUNT RECOVERY OTP]');
    console.log(`📧 Target Email: ${toEmail}`);
    console.log(`🔑 OTP Code:     ${otp}`);
    console.log('⏱️  Valid for:    15 minutes');
    console.log('ℹ️  Note: SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    console.log('   are not configured in .env.local. Simulating email send.');
    console.log('========================================================\n');
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === 'true',
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 700; }
          .header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
          .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; text-align: center; padding: 24px; margin: 28px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #2563eb; font-family: 'Courier New', monospace; margin: 0; }
          .notice { font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 28px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>The Window & Door Store</h1>
            <p>Password Reset Request</p>
          </div>
          <p style="font-size: 15px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.5; color: #334155;">
            We received a request to reset the password for your account. Use the one-time passcode (OTP) below to complete your password reset:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0; font-size: 13px; color: #64748b; font-weight: 500;">
              This code will expire in <b>15 minutes</b>.
            </p>
          </div>
          <div class="notice">
            <p style="margin: 0 0 8px;"><b>Didn't request this code?</b></p>
            <p style="margin: 0;">If you did not request a password reset, you can safely ignore this email. Your current password remains secure.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} The Window & Door Store. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `${otp} is your password reset code - The Window & Door Store`,
      text: `Your password reset code is: ${otp}\nThis code expires in 15 minutes.\nIf you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send OTP email via SMTP:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}
