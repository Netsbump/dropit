import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { EmailData, IEmailTransport } from './email-channel.port';
import { EmailSendFailedException } from '../../exceptions/infrastructure.exceptions';

/**
 * Brevo Email Adapter (Production)
 *
 * Implements IEmailTransport using Brevo (formerly Sendinblue) API.
 * Receives a rendered EmailData and delivers it — no template logic here.
 */
@Injectable()
export class BrevoAdapter implements IEmailTransport {
  private brevoApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
    private readonly fromName: string,
  ) {
    this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
    this.brevoApi.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      this.apiKey
    );
    console.log('📧 [BrevoAdapter] Initialized with Brevo API');
  }

  async send(emailData: EmailData): Promise<void> {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: emailData.to }];
      sendSmtpEmail.subject = emailData.subject;
      sendSmtpEmail.htmlContent = emailData.htmlContent;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail
      };

      const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log('📧 [BrevoAdapter] Email sent successfully:', {
        messageId: result.body.messageId,
        to: emailData.to,
        subject: emailData.subject
      });
    } catch (error) {
      console.error('❌ [BrevoAdapter] Error sending email:', error);
      throw new EmailSendFailedException(`Failed to send email via Brevo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
