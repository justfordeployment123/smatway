import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly apiKeyConfigured: boolean;
  private readonly sendingEnabled: boolean;

  constructor() {
    const key = process.env.RESEND_API_KEY ?? '';
    this.apiKeyConfigured = key.length > 0;
    // OTP_SEND_EMAIL acts as a hard on/off switch. Only 'true' or '1' enables real sends.
    this.sendingEnabled = /^(true|1)$/i.test(process.env.OTP_SEND_EMAIL ?? '');
    if (!this.sendingEnabled) {
      this.logger.warn('OTP_SEND_EMAIL is not true — OTP emails will NOT be sent. The code is logged to the console instead. Set OTP_SEND_EMAIL=true in apps/api/.env to enable.');
    } else if (!this.apiKeyConfigured) {
      this.logger.warn('RESEND_API_KEY is not set — OTP emails cannot be sent even though OTP_SEND_EMAIL is true.');
    }
    this.resend = new Resend(key);
    this.from = process.env.MAIL_FROM ?? 'onboarding@resend.dev';
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Reset your SmatWay password',
        html: `
          <p>You requested a password reset for your SmatWay account.</p>
          <p>Click the link below to set a new password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If you did not request this, ignore this email — your password will not change.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${email}`, error);
    }
  }

  async sendVerificationOtp(email: string, code: string, name?: string | null): Promise<void> {
    if (!this.sendingEnabled) {
      this.logger.log(`OTP email for ${email} skipped (OTP_SEND_EMAIL=false).`);
      return;
    }
    if (!this.apiKeyConfigured) {
      this.logger.warn(`Skipping OTP email to ${email} — RESEND_API_KEY not configured.`);
      return;
    }
    const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Welcome to SmatWay,';
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `${code} is your SmatWay verification code`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a;">
            <div style="background:linear-gradient(135deg,#10b981,#0d9488);height:4px;border-radius:4px;margin-bottom:32px;"></div>
            <h1 style="font-size:22px;font-weight:600;margin:0 0 16px 0;letter-spacing:-0.01em;">${greeting}</h1>
            <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
              Use the code below to verify your email and finish setting up your account.
            </p>
            <div style="text-align:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;">
              <div style="font-family:'SF Mono',Menlo,monospace;font-size:36px;font-weight:700;letter-spacing:0.4em;color:#065f46;">${code}</div>
              <div style="font-size:12px;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:0.1em;">Expires in 10 minutes</div>
            </div>
            <p style="font-size:13px;line-height:1.6;color:#64748b;margin:24px 0 0 0;">
              If you did not sign up for SmatWay, ignore this email — no account will be created without this code.
            </p>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
              SmatWay — travel the way it should be.
            </div>
          </div>
        `,
      });
      if (error) {
        // Resend returns `{ data: null, error: {...} }` on domain/auth problems instead of throwing.
        this.logger.error(`Resend rejected OTP email to ${email}: ${error.name} — ${error.message}`);
        throw error;
      }
      this.logger.log(`Sent OTP email to ${email} (id=${data?.id ?? 'unknown'})`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
      throw error;
    }
  }
}
