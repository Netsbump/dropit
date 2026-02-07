import { Injectable } from "@nestjs/common";
import { config } from "src/config/env.config";
import { KIND, NotificationRequest } from "../../../application/ports/outbound/notification.port";
import { BrevoAdapter } from "./brevo.adapter";
import { EmailData, IEmailChannel } from "./email-channel.port";
import { MaildevAdapter } from "./maildev.adapter";

@Injectable()
export class EmailAdapter implements IEmailChannel {

  private readonly isProduction = config.env === "production";

  constructor(
    private readonly brevoAdapter: BrevoAdapter,
    private readonly maildevAdapter: MaildevAdapter,
  ) {}

  async send(request: NotificationRequest): Promise<void> {
    const emailData = this.buildEmail(request);

    if (this.isProduction) {
      await this.brevoAdapter.send(emailData);
    } else {
      await this.maildevAdapter.send(emailData);
    }
  }

  private buildEmail(request: NotificationRequest): EmailData {
    switch (request.kind) {
      case KIND.ORGANIZATION_INVITATION:
        return {
          to: request.email,
          subject: `Invitation à rejoindre ${request.organizationName}`,
          htmlContent: this.renderOrganizationInvitation(request)
        }

      case KIND.OTP:
        return {
          to: request.email,
          subject: 'Votre code de vérification DropIt',
          htmlContent: this.renderOtpCode(request),
        };

      default: {
        const _exhaustive: never = request;
        throw new Error('Unhandled notification kind');
      }
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

