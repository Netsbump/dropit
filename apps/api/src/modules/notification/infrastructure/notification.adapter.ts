import { Inject, Injectable } from '@nestjs/common';
import {
  INotificationPort,
  NotificationRequest,
} from '../application/ports/outbound/notification.port';
import { EMAIL_CHANNEL_PORT, IEmailChannel } from './channels/email/email-channel.port';
import { PUSH_CHANNEL_PORT, IPushChannel } from './channels/push/push-channel.port';
import { SMS_CHANNEL_PORT, ISmsChannel } from './channels/sms/sms-channel.port';
import { Transport, TRANSPORT } from './notification.types';

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
    const channel = this.resolveChannel(request)

    switch (channel) {
      case TRANSPORT.EMAIL: return this.emailChannel.send(request);
      case TRANSPORT.SMS: return this.smsChannel.send(request);
      case TRANSPORT.PUSH: return this.pushChannel.send(request);
    }
  }

  /**
   * Determines which transport to use for a given notification.
   * Resolution order:
   * 1. Notification kind (e.g. OTP on mobile → SMS)
   * 2. Request origin (web vs mobile app)
   * 3. User preferences if applicable
   */
  private resolveChannel(request: NotificationRequest): Transport {
    //TODO
    return TRANSPORT.EMAIL;
  }

}
