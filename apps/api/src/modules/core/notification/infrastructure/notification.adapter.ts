import { Inject, Injectable } from '@nestjs/common';
import {
  INotificationPort,
  IEmailParams,
  ISmsParams,
  IPushParams,
} from '../application/ports/out/notification.port';
import { IEmailPort, EMAIL_PORT } from '../application/ports/out/email.port';
import {
  NotificationServiceNotConfiguredException,
  EmailSendFailedException,
  SmsSendFailedException,
  PushSendFailedException,
} from '../application/exceptions/notification.exceptions';

/**
 * Notification Adapter (Infrastructure Layer)
 *
 * @description
 * Implements INotificationPort by routing notifications to the appropriate
 * transport services (email, SMS, push).
 *
 * @remarks
 * This adapter delegates to specific transport implementations:
 * - Email: IEmailPort (implemented by BrevoAdapter or MaildevAdapter)
 * - SMS: Not yet implemented
 * - Push: Not yet implemented
 */
@Injectable()
export class NotificationAdapter implements INotificationPort {
  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: IEmailPort,
    // TODO: Inject SMS and Push services when available
    // @Inject(SMS_PORT) private readonly smsPort?: ISmsPort,
    // @Inject(PUSH_PORT) private readonly pushPort?: IPushPort,
  ) {}

  async sendEmail(params: IEmailParams): Promise<void> {
    try {
      await this.emailPort.send({
        to: params.to,
        subject: params.subject,
        template: params.template,
        data: params.data,
      });
    } catch (error) {
      console.error('❌ [NotificationAdapter] Failed to send email:', error);
      throw new EmailSendFailedException(
        `Failed to send email to ${params.to}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async sendSms(params: ISmsParams): Promise<void> {
    // TODO: Implement SMS sending when SMS service is available
    throw new NotificationServiceNotConfiguredException('SMS');

    // When implemented:
    // if (!this.smsPort) {
    //   throw new NotificationServiceNotConfiguredException('SMS');
    // }
    // try {
    //   await this.smsPort.send(params);
    // } catch (error) {
    //   throw new SmsSendFailedException(
    //     `Failed to send SMS to ${params.to}: ${error.message}`
    //   );
    // }
  }

  async sendPush(params: IPushParams): Promise<void> {
    // TODO: Implement push notification when push service is available
    throw new NotificationServiceNotConfiguredException('Push');

    // When implemented:
    // if (!this.pushPort) {
    //   throw new NotificationServiceNotConfiguredException('Push');
    // }
    // try {
    //   await this.pushPort.send(params);
    // } catch (error) {
    //   throw new PushSendFailedException(
    //     `Failed to send push notification to user ${params.userId}: ${error.message}`
    //   );
    // }
  }
}
