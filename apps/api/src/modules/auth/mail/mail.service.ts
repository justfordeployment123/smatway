import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY ?? '');
    this.from = process.env.MAIL_FROM ?? 'noreply@smatway.com';
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
}
