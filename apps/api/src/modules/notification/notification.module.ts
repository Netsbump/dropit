import { Module, forwardRef } from '@nestjs/common';
import { NotificationUseCase } from './application/use-cases/notification.use-cases';
import { NOTIFICATION_USE_CASES } from './application/ports/inbound/notification-use-cases.port';
import { NOTIFICATION_PORT } from './application/ports/outbound/notification.port';
import { NotificationAdapter } from './infrastructure/notification.adapter';

// Email channel
import { EMAIL_CHANNEL_PORT } from './infrastructure/channels/email/email-channel.port';
import { EmailAdapter } from './infrastructure/channels/email/email.adapter';

// SMS channel
import { SMS_CHANNEL_PORT } from './infrastructure/channels/sms/sms-channel.port';
import { SmsAdapter } from './infrastructure/channels/sms/sms.adapter';

// Push channel
import { PUSH_CHANNEL_PORT } from './infrastructure/channels/push/push-channel.port';
import { PushAdapter } from './infrastructure/channels/push/push.adapter';

import { AuthModule } from '../auth/auth.module';


/**
 * Notification Module
 *
 * @description
 * Provides notification services for the application following Clean Architecture principles.
 *
 * @remarks
 * Module structure:
 * - Port IN: INotificationUseCases (exposed to other modules)
 * - Use Case: NotificationUseCase (business logic, decides which channel to use)
 * - Port OUT: INotificationPort (routes to the right channel)
 * - Channel Adapters: Email (Brevo/Maildev), SMS (Twilio), Push (Firebase)
 *
 * Email provider selection:
 * - Production: BrevoAdapter (Brevo API)
 * - Development: MaildevAdapter (local SMTP)
 */
@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  providers: [
    // Use Case (Port IN implementation)
    {
      provide: NOTIFICATION_USE_CASES,
      useClass: NotificationUseCase,
    },

    // Notification Adapter (Port OUT - routes to channels)
    {
      provide: NOTIFICATION_PORT,
      useClass: NotificationAdapter,
    },

    // Email Channel (switch based on environment)
    {
      provide: EMAIL_CHANNEL_PORT,
      useClass: EmailAdapter,
    },

    // SMS Channel (not implemented yet, throws error)
    {
      provide: SMS_CHANNEL_PORT,
      useClass: SmsAdapter,
    },

    // Push Channel (not implemented yet, throws error)
    {
      provide: PUSH_CHANNEL_PORT,
      useClass: PushAdapter,
    },
  ],
  exports: [
    NOTIFICATION_USE_CASES,
  ],
})
export class NotificationModule {}
