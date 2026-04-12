import { Module } from '@nestjs/common';
import { NotificationUseCase } from './application/use-cases/notification.use-cases';
import { NOTIFICATION_USE_CASES } from './application/ports/inbound/notification-use-cases.port';
import { type INotificationPort, NOTIFICATION_PORT } from './application/ports/outbound/notification.port';
import { NotificationAdapter } from './infrastructure/notification.adapter';
import { config } from '../../config/env.config';

// Email channel
import { EMAIL_CHANNEL_PORT, EMAIL_TRANSPORT, IEmailTransport } from './infrastructure/channels/email/email-channel.port';
import { BrevoAdapter } from './infrastructure/channels/email/brevo.adapter';
import { EmailAdapter } from './infrastructure/channels/email/email.adapter';
import { MaildevAdapter } from './infrastructure/channels/email/maildev.adapter';

// SMS channel
import { SMS_CHANNEL_PORT } from './infrastructure/channels/sms/sms-channel.port';
import { SmsAdapter } from './infrastructure/channels/sms/sms.adapter';

// Push channel
import { PUSH_CHANNEL_PORT } from './infrastructure/channels/push/push-channel.port';
import { PushAdapter } from './infrastructure/channels/push/push.adapter';

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
  providers: [
    // Use Case (Port IN — plain class, no NestJS decorators)
    {
      provide: NOTIFICATION_USE_CASES,
      useFactory: (notificationPort: INotificationPort) =>
        new NotificationUseCase(notificationPort),
      inject: [NOTIFICATION_PORT],
    },

    // Notification Adapter (Port OUT - routes to channels)
    {
      provide: NOTIFICATION_PORT,
      useClass: NotificationAdapter,
    },

    // Email Channel (switch based on environment)
    {
      provide: EMAIL_TRANSPORT,
      useFactory: (): IEmailTransport => {
        if (config.env !== 'production') {
          return new MaildevAdapter(
            config.email.maildev.host,
            config.email.maildev.smtpPort,
            config.email.maildev.webPort,
            config.email.sender.fromEmail,
            config.email.sender.fromName,
            config.email.maildev.user,
            config.email.maildev.pass,
          );
        }

        if (!config.email.brevo.apiKey) {
          throw new Error('BREVO_API_KEY is required in production');
        }

        return new BrevoAdapter(
          config.email.brevo.apiKey,
          config.email.sender.fromEmail,
          config.email.sender.fromName,
        );
      },
    },
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
