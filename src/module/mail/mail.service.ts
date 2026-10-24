import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}
  async sendPasswordReset(email: string, token: string) {
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!user || !pass)
      throw new ServiceUnavailableException(
        'Password reset email is not configured yet.',
      );
    const url = new URL(
      '/reset-password',
      this.config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    );
    url.searchParams.set('token', token);
    const transport = createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: Number(this.config.get('SMTP_PORT', 587)),
      secure: this.config.get('SMTP_SECURE', 'false') === 'true',
      auth: { user, pass },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    });
    await transport.sendMail({
      from: this.config.get<string>('SMTP_FROM') || user,
      to: email,
      subject: 'Reset your Taskflow password',
      text: `Reset your password using this link (valid for 30 minutes):\n${url.toString()}\n\nIf you did not request this, ignore this email.`,
    });
  }
}
