import { Inject, Injectable } from '@nestjs/common';
import {
  INotificationPort,
  NotificationRequest,
} from '../application/ports/outbound/notification.port';
import {
  NotificationServiceNotConfiguredException,
  EmailSendFailedException,
} from '../application/exceptions/notification.exceptions';
import { EMAIL_CHANNEL_PORT, IEmailChannel } from './channels/email/email-channel.port';
import { PUSH_CHANNEL_PORT, IPushChannel } from './channels/push/push-channel.port';
import { SMS_CHANNEL_PORT, ISmsChannel } from './channels/sms/sms-channel.port';

/**
 * Notification Adapter
 *
 * @description
 * Implements INotificationPort by routing notifications to the appropriate
 * transport services (email, SMS, push).
 *
 * @remarks
 * This adapter delegates to specific transport implementations:
 * - Email: IEmailChannel (implemented by EmailAdapter)
 * - SMS: ISmsChannel (implemented by SmsAdapter)
 * - Push: IPushChannel (implemented by PushAdapter)
 */
@Injectable()
export class NotificationAdapter implements INotificationPort {
  constructor(
    @Inject(EMAIL_CHANNEL_PORT)
    private readonly emailChannel: IEmailChannel,
    @Inject(SMS_CHANNEL_PORT)
    private readonly smsChannel: ISmsChannel,
    @Inject(PUSH_CHANNEL_PORT)
    private readonly pushChannel: IPushChannel,
  ) { }

  async send(request: NotificationRequest): Promise<void> {
    //TODO Switch and call the right adapters depends on Kind of NotificationRequest ?
    const channel = this.resolveChannel(request)

    switch (channel) {
      case 'email': return this.emailChannel.send(request);
      case 'sms': return this.smsChannel.send(request);
      case 'push': return this.pushChannel.send(request);
    }
  }

  private resolveChannel(request: NotificationRequest): 'email' | 'sms' | 'push' {
    //TODO determine logic based on user preferences, if user is new, where request comes from (eg: mobile or web app)
    return 'email';
  }
  
}
