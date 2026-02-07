import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SERVICE, IEmailService } from './email.port';

export interface EmailData {
  to: string;
  subject: string;
  content: string;
}

export interface InvitationEmailData {
  to: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  inviteLink: string;
}

/**
 * Email service with business logic
 * Uses injected IEmailService for actual email transport
 */
@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_SERVICE) private readonly emailTransport: IEmailService
  ) {
    console.log('📧 [EmailService] Initialized with email transport');
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    const { to, subject, content } = emailData;
    await this.emailTransport.sendEmail(to, subject, content);
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const { to, inviterName, inviterEmail, organizationName, inviteLink } = data;
    
    const subject = `Invitation à rejoindre ${organizationName}`;
    const content = this.generateInvitationEmailContent({
      inviterName,
      inviterEmail,
      organizationName,
      inviteLink,
    });

    await this.sendEmail({
      to,
      subject,
      content,
    });
  }

  private generateInvitationEmailContent(data: Omit<InvitationEmailData, 'to'>): string {
    const { inviterName, inviterEmail, organizationName, inviteLink } = data;
    
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
            
            <p><strong>${inviterName}</strong> (${inviterEmail}) vous invite à rejoindre le club <strong>${organizationName}</strong> sur DropIt.</p>
            
            <p>En tant qu'athlète, vous pourrez :</p>
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
              Ce lien expirera dans 7 jours. Si vous n'avez pas de compte DropIt, 
              vous serez redirigé vers la page d'inscription.
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
}
