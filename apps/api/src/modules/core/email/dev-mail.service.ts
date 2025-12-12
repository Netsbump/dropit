import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService } from './email.port';

@Injectable()
export class DevMailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration SMTP pour Maildev (localhost)
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILDEV_HOST || 'localhost',
      port: parseInt(process.env.MAILDEV_SMTP_PORT || '1025', 10),
      ignoreTLS: true, // Maildev ne nécessite pas TLS
      auth: process.env.MAILDEV_USER && process.env.MAILDEV_PASS
        ? {
            user: process.env.MAILDEV_USER,
            pass: process.env.MAILDEV_PASS,
          }
        : undefined,
    });

    console.log('📧 [DevMailService] Initialized with Maildev SMTP:', {
      host: process.env.MAILDEV_HOST || 'localhost',
      port: process.env.MAILDEV_SMTP_PORT || '1025',
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.BREVO_FROM_NAME || 'DropIt Dev'}" <${process.env.BREVO_FROM_EMAIL || 'noreply@dropit.local'}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log('📧 [DevMailService] Email sent successfully:', {
        messageId: info.messageId,
        to,
        subject,
        preview: `http://localhost:${process.env.MAILDEV_WEB_PORT || '1080'}`,
      });
    } catch (error) {
      console.error('❌ [DevMailService] Error sending email:', error);
      throw new Error(`Failed to send email via Maildev: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
