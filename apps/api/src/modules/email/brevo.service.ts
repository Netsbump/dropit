import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { config } from '../../config/env.config';
import { IEmailService } from './email.port';

@Injectable()
export class BrevoService implements IEmailService {
  private readonly fromEmail = config.email.fromEmail;
  private readonly fromName = config.email.fromName;
  private brevoApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    if (!config.email.brevoApiKey) {
      throw new Error('BREVO_API_KEY is required for BrevoService');
    }

    this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
    this.brevoApi.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      config.email.brevoApiKey
    );
    console.log('📧 [BrevoService] Initialized with Brevo API');
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail
      };

      const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log('📧 [BrevoService] Email sent successfully:', {
        messageId: result.body.messageId,
        to,
        subject,
      });
    } catch (error) {
      console.error('❌ [BrevoService] Error sending email:', error);
      throw new Error(`Failed to send email via Brevo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
