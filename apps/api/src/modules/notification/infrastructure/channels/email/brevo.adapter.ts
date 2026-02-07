import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { config } from '../../../../../config/env.config';
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
