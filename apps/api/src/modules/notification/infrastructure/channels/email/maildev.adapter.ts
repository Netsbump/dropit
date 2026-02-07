import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../../../../../config/env.config';
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

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILDEV_HOST || 'localhost',
      port: parseInt(process.env.MAILDEV_SMTP_PORT || '1025', 10),
      ignoreTLS: true,
      auth: process.env.MAILDEV_USER && process.env.MAILDEV_PASS
        ? {
          user: process.env.MAILDEV_USER,
          pass: process.env.MAILDEV_PASS,
        }
        : undefined,
    });

    console.log('📧 [MaildevAdapter] Initialized with Maildev SMTP:', {
      host: process.env.MAILDEV_HOST || 'localhost',
      port: process.env.MAILDEV_SMTP_PORT || '1025',
      webUI: `http://localhost:${process.env.MAILDEV_WEB_PORT || '1080'}`,
    });
  }

  async send(emailData: EmailData): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
      });

      console.log('📧 [MaildevAdapter] Email sent successfully:', {
        messageId: info.messageId,
        to: emailData.to,
        subject: emailData.subject,
        preview: `http://localhost:${process.env.MAILDEV_WEB_PORT || '1080'}`,
      });
    } catch (error) {
      console.error('❌ [MaildevAdapter] Error sending email:', error);
      throw new EmailSendFailedException(`Failed to send email via Maildev: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
