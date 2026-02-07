import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { config } from '../../../../../config/env.config';
import { IEmailChannel } from './email-channel.port';
import { NotificationRequest, KIND } from '../../../application/ports/outbound/notification.port';

/**
 * Brevo Email Adapter (Production)
 *
 * @description
 * Implements IEmailChannel using Brevo (formerly Sendinblue) as the email provider.
 * Handles template rendering and email delivery through Brevo API.
 *
 * @remarks
 * This adapter is used in production environments.
 */
@Injectable()
export class BrevoAdapter implements IEmailChannel {
  private readonly fromEmail = config.email.fromEmail;
  private readonly fromName = config.email.fromName;
  private brevoApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    if (!config.email.brevoApiKey) {
      throw new Error('BREVO_API_KEY is required for BrevoAdapter');
    }

    this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
    this.brevoApi.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      config.email.brevoApiKey
    );
    console.log('📧 [BrevoAdapter] Initialized with Brevo API');
  }

  async send(request: NotificationRequest): Promise<void> {
    try {
      const { to, subject, htmlContent } = this.buildEmail(request);

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail
      };

      const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log('📧 [BrevoAdapter] Email sent successfully:', {
        messageId: result.body.messageId,
        to,
        subject,
        kind: request.kind,
      });
    } catch (error) {
      console.error('❌ [BrevoAdapter] Error sending email:', error);
      throw new Error(`Failed to send email via Brevo: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
