import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../../../../../config/env.config';
import { IEmailChannel } from './email-channel.port';
import { NotificationRequest, KIND } from '../../../application/ports/outbound/notification.port';

/**
 * Maildev Email Adapter (Development)
 *
 * @description
 * Implements IEmailChannel using Maildev as the email provider.
 * Maildev is a local SMTP server for development and testing.
 * Handles template rendering and email delivery through SMTP.
 *
 * @remarks
 * This adapter is used in development environments.
 * Emails can be viewed at http://localhost:1080
 */
@Injectable()
export class MaildevAdapter implements IEmailChannel {
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

  async send(request: NotificationRequest): Promise<void> {
    try {
      const { to, subject, htmlContent } = this.buildEmail(request);

      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log('📧 [MaildevAdapter] Email sent successfully:', {
        messageId: info.messageId,
        to,
        subject,
        kind: request.kind,
        preview: `http://localhost:${process.env.MAILDEV_WEB_PORT || '1080'}`,
      });
    } catch (error) {
      console.error('❌ [MaildevAdapter] Error sending email:', error);
      throw new Error(`Failed to send email via Maildev: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build email content based on notification kind
   */
  private buildEmail(request: NotificationRequest): { to: string; subject: string; htmlContent: string } {
    switch (request.kind) {
      case KIND.ORGANIZATION_INVITATION:
        return {
          to: request.email,
          subject: `Invitation à rejoindre ${request.organizationName}`,
          htmlContent: this.renderOrganizationInvitation(request),
        };

      case KIND.OTP:
        return {
          to: request.email,
          subject: 'Votre code de vérification DropIt',
          htmlContent: this.renderOtpCode(request),
        };

      default:
        throw new Error(`Unknown notification kind: ${(request as any).kind}`);
    }
  }

  private renderOrganizationInvitation(request: Extract<NotificationRequest, { kind: typeof KIND.ORGANIZATION_INVITATION }>): string {
    const inviteLink = `${config.appUrl}/accept-invitation/${request.invitationToken}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation à rejoindre ${request.organizationName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DropIt</h1>
            <h2>Invitation à rejoindre ${request.organizationName}</h2>
          </div>

          <div class="content">
            <p>Bonjour,</p>

            <p><strong>${request.invitedBy}</strong> vous invite à rejoindre le club <strong>${request.organizationName}</strong> sur DropIt.</p>

            <p>En rejoignant ce club, vous pourrez :</p>
            <ul>
              <li>Suivre vos entraînements en temps réel</li>
              <li>Enregistrer vos performances</li>
              <li>Recevoir des programmes personnalisés</li>
              <li>Communiquer avec votre coach</li>
            </ul>

            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">
                Accepter l'invitation
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Ce lien expirera dans 7 jours.
            </p>
          </div>

          <div class="footer">
            <p>DropIt - Plateforme de coaching sportif</p>
            <p>Si vous ne souhaitez pas recevoir cette invitation, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderOtpCode(request: Extract<NotificationRequest, { kind: typeof KIND.OTP }>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Votre code de vérification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .otp-code { font-size: 32px; font-weight: bold; text-align: center; background: white; padding: 20px; border-radius: 8px; letter-spacing: 8px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Code de vérification</h1>
          </div>

          <div class="content">
            <p>Voici votre code de vérification DropIt :</p>

            <div class="otp-code">
              ${request.otp}
            </div>

            <p style="text-align: center; margin-top: 20px; color: #6b7280;">
              Ce code expire dans 10 minutes.
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #dc2626;">
              Ne partagez jamais ce code avec qui que ce soit.
            </p>
          </div>

          <div class="footer">
            <p>DropIt - Plateforme de coaching sportif</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
