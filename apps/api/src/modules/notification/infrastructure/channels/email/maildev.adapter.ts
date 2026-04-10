import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailData, IEmailTransport } from './email-channel.port';
import { EmailSendFailedException } from '../../exceptions/infrastructure.exceptions';

/**
 * Maildev Email Adapter (Development)
 *
 * Implements IEmailTransport using a local Maildev SMTP server.
 * Receives a rendered EmailData and delivers it — no template logic here.
 * Emails can be viewed at http://localhost:1080
 */
@Injectable()
export class MaildevAdapter implements IEmailTransport {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly host: string,
    private readonly smtpPort: number,
    private readonly webPort: number,
    private readonly fromEmail: string,
    private readonly fromName: string,
    private readonly user?: string,
    private readonly pass?: string,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.smtpPort,
      ignoreTLS: true,
      auth: this.user && this.pass
        ? {
          user: this.user,
          pass: this.pass,
        }
        : undefined,
    });

    console.log('📧 [MaildevAdapter] Initialized with Maildev SMTP:', {
      host: this.host,
      port: this.smtpPort,
      webUI: `http://localhost:${this.webPort}`,
    });
  }

  async send(emailData: EmailData): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
      });

      console.log('📧 [MaildevAdapter] Email sent successfully:', {
        messageId: info.messageId,
        to: emailData.to,
        subject: emailData.subject,
        preview: `http://localhost:${this.webPort}`,
      });
    } catch (error) {
      console.error('❌ [MaildevAdapter] Error sending email:', error);
      throw new EmailSendFailedException(`Failed to send email via Maildev: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
