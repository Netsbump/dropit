import { Injectable } from "@nestjs/common";
import { config } from "src/config/env.config";
import { KIND, NotificationRequest } from "../../../application/ports/outbound/notification.port";
import { BrevoAdapter } from "./brevo.adapter";
import { EmailData, IEmailChannel } from "./email-channel.port";
import { MaildevAdapter } from "./maildev.adapter";
import { renderEmailLayout } from "./email-template";

@Injectable()
export class EmailAdapter implements IEmailChannel {

  private readonly isProduction = config.env === "production";

  constructor(
    private readonly brevoAdapter: BrevoAdapter,
    private readonly maildevAdapter: MaildevAdapter,
  ) { }

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

      case KIND.OTP: {
        if (!('email' in request.otpParams)) {
          throw new Error('Otp notification routed to email channel without email address');
        }
        return {
          to: request.otpParams.email,
          subject: 'Votre code de vérification DropIt',
          htmlContent: this.renderOtpCode(request),
        };
      }


      case KIND.VERIFICATION_USER_EMAIL:
        return {
          to: request.email,
          subject: 'Vérification de votre adresse email',
          htmlContent: this.renderVerificationUserEmail(request),
        }

      default: {
        const _exhaustive:never = request;
        throw new Error(`Unhandled notification kind: ${_exhaustive}`);
      }
    }
  }

  private renderVerificationUserEmail(request: Extract<NotificationRequest, { kind: typeof KIND.VERIFICATION_USER_EMAIL }>): string {
    return renderEmailLayout({
      title: 'Vérification de votre adresse email',
      headerContent: `
        <h1>DropIt</h1>
        <h2>Vérification de votre adresse email</h2>
      `,
      bodyContent: `
        <p>Bonjour,</p>
        <p>Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.</p>
        <div style="text-align: center;">
          <a href="${request.url}" class="button">Vérifier mon adresse email</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Ce lien expirera dans 10 jours.
        </p>
      `,
      footerContent: `<p>Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>`,
    });
  }

  private renderOrganizationInvitation(request: Extract<NotificationRequest, { kind: typeof KIND.ORGANIZATION_INVITATION }>): string {
    const inviteLink = `${config.appUrl}/accept-invitation/${request.invitationToken}`;

    return renderEmailLayout({
      title: `Invitation à rejoindre ${request.organizationName}`,
      headerContent: `
        <h1>DropIt</h1>
        <h2>Invitation à rejoindre ${request.organizationName}</h2>
      `,
      bodyContent: `
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
          <a href="${inviteLink}" class="button">Accepter l'invitation</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Ce lien expirera dans 48 heures.
        </p>
      `,
      footerContent:
        "<p>Si vous ne souhaitez pas recevoir cette invitation, vous pouvez ignorer cet email.</p>",
    });
  }

  private renderOtpCode(request: Extract<NotificationRequest, { kind: typeof KIND.OTP }>): string {
    return renderEmailLayout({
      title: 'Votre code de vérification',
      headerContent: "<h1>Code de vérification</h1>",
      extraStyles:
        ".otp-code { font-size: 32px; font-weight: bold; text-align: center; background: white; padding: 20px; border-radius: 8px; letter-spacing: 8px; }",
      bodyContent: `
        <p>Voici votre code de vérification DropIt :</p>
        <div class="otp-code">${request.otpParams.otp}</div>
        <p style="text-align: center; margin-top: 20px; color: #6b7280;">
          Ce code expire dans 5 minutes.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #dc2626;">
          Ne partagez jamais ce code avec qui que ce soit.
        </p>
      `,
    });
  }
}

