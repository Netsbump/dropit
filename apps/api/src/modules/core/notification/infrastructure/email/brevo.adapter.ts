import { Injectable } from '@nestjs/common';
import { IEmailPort, IEmailSendParams } from '../../application/ports/outbound/email.port';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { config } from '../../../../../config/env.config';
import { EmailTemplate } from '../../domain/notification-transport';

/**
 * Brevo Email Adapter (Production)
 *
 * @description
 * Implements IEmailPort using Brevo (formerly Sendinblue) as the email provider.
 * Handles template rendering and email delivery through Brevo API.
 *
 * @remarks
 * This adapter is used in production environments.
 */
@Injectable()
export class BrevoAdapter implements IEmailPort {
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

  async send(params: IEmailSendParams): Promise<void> {
    try {
      const htmlContent = this.renderTemplate(params.template, params.data || {});

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: params.to }];
      sendSmtpEmail.subject = params.subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail
      };

      const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log('📧 [BrevoAdapter] Email sent successfully:', {
        messageId: result.body.messageId,
        to: params.to,
        subject: params.subject,
        template: params.template,
      });
    } catch (error) {
      console.error('❌ [BrevoAdapter] Error sending email:', error);
      throw new Error(`Failed to send email via Brevo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Render email template with data
   *
   * @remarks
   * For now, this uses simple HTML templates.
   * In the future, consider using a proper template engine (Handlebars, Pug, etc.)
   */
  private renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
    switch (template) {
      case 'organization-invitation':
        return this.renderOrganizationInvitation(data);
      case 'organization-invitation-new-user':
        return this.renderOrganizationInvitationNewUser(data);
      case 'otp-code':
        return this.renderOtpCode(data);
      case 'workout-reminder':
        return this.renderWorkoutReminder(data);
      case 'password-reset':
        return this.renderPasswordReset(data);
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  private renderOrganizationInvitation(data: Record<string, unknown>): string {
    const { organizationName, invitedBy, token } = data;
    const inviteLink = `${config.appUrl}/invite/${token}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation à rejoindre ${organizationName}</title>
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
            <h1>🏋️ DropIt</h1>
            <h2>Invitation à rejoindre ${organizationName}</h2>
          </div>

          <div class="content">
            <p>Bonjour,</p>

            <p><strong>${invitedBy}</strong> vous invite à rejoindre le club <strong>${organizationName}</strong> sur DropIt.</p>

            <p>En rejoignant ce club, vous pourrez :</p>
            <ul>
              <li>📊 Suivre vos entraînements en temps réel</li>
              <li>📈 Enregistrer vos performances</li>
              <li>🎯 Recevoir des programmes personnalisés</li>
              <li>💬 Communiquer avec votre coach</li>
            </ul>

            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">
                ✅ Accepter l'invitation
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

  private renderOrganizationInvitationNewUser(data: Record<string, unknown>): string {
    const { organizationName, invitedBy, token } = data;
    const signupLink = `${config.appUrl}/signup?invite=${token}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vous êtes invité à rejoindre DropIt</title>
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
            <h1>🏋️ Bienvenue sur DropIt</h1>
          </div>

          <div class="content">
            <p>Bonjour,</p>

            <p><strong>${invitedBy}</strong> vous invite à rejoindre <strong>${organizationName}</strong> sur DropIt, la plateforme de coaching sportif.</p>

            <p>Pour accepter cette invitation, créez votre compte :</p>

            <div style="text-align: center;">
              <a href="${signupLink}" class="button">
                🚀 Créer mon compte
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Ce lien expirera dans 7 jours.
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

  private renderOtpCode(data: Record<string, unknown>): string {
    const { otp, expiresIn } = data;

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
            <h1>🔐 Code de vérification</h1>
          </div>

          <div class="content">
            <p>Voici votre code de vérification DropIt :</p>

            <div class="otp-code">
              ${otp}
            </div>

            <p style="text-align: center; margin-top: 20px; color: #6b7280;">
              Ce code expire dans ${expiresIn}.
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #dc2626;">
              ⚠️ Ne partagez jamais ce code avec qui que ce soit.
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

  private renderWorkoutReminder(data: Record<string, unknown>): string {
    const { workoutName, scheduledAt, userName } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel d'entraînement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel d'entraînement</h1>
          </div>

          <div class="content">
            <p>Bonjour ${userName},</p>

            <p>Rappel : Votre séance <strong>${workoutName}</strong> est prévue pour ${scheduledAt}.</p>

            <p>Bon entraînement ! 💪</p>
          </div>

          <div class="footer">
            <p>DropIt - Plateforme de coaching sportif</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderPasswordReset(data: Record<string, unknown>): string {
    const { resetToken } = data;
    const resetLink = `${config.appUrl}/reset-password?token=${resetToken}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de mot de passe</title>
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
            <h1>🔑 Réinitialisation de mot de passe</h1>
          </div>

          <div class="content">
            <p>Bonjour,</p>

            <p>Vous avez demandé à réinitialiser votre mot de passe DropIt.</p>

            <div style="text-align: center;">
              <a href="${resetLink}" class="button">
                Réinitialiser mon mot de passe
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Ce lien expirera dans 1 heure.
            </p>

            <p style="margin-top: 20px; font-size: 14px; color: #dc2626;">
              ⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
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
