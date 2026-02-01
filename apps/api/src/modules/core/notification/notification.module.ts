import { Module } from '@nestjs/common';
import { NotificationUseCase } from './application/use-cases/notification.use-cases';
import { NOTIFICATION_USE_CASES } from './application/ports/inbound/notification-use-cases.port';
import { NOTIFICATION_PORT } from './application/ports/outbound/notification.port';
import { EMAIL_PORT } from './application/ports/outbound/email.port';
import { NotificationAdapter } from './infrastructure/notification.adapter';
import { BrevoAdapter } from './infrastructure/email/brevo.adapter';
import { MaildevAdapter } from './infrastructure/email/maildev.adapter';
import { IdentityModule } from '../../identity/identity.module';
import { config } from '../../../config/env.config';

/**
 * Notification Module
 *
 * @description
 * Provides notification services for the application following Clean Architecture principles.
 *
 * @remarks
 * Module structure:
 * - Port IN: INotificationUseCases (exposed to other modules)
 * - Use Case: NotificationUseCase (business logic)
 * - Port OUT: INotificationPort, IEmailPort (infrastructure abstraction)
 * - Adapters: NotificationAdapter, BrevoAdapter, MaildevAdapter (infrastructure implementation)
 *
 * Email provider selection:
 * - Production: BrevoAdapter (Brevo API)
 * - Development: MaildevAdapter (local SMTP)
 */
@Module({
  imports: [
    IdentityModule, // For UserRepository
  ],
  providers: [
    // Use Case (Port IN implementation)
    {
      provide: NOTIFICATION_USE_CASES,
      useClass: NotificationUseCase,
    },

    // Notification Adapter (Port OUT implementation)
    {
      provide: NOTIFICATION_PORT,
      useClass: NotificationAdapter,
    },

    // Email Adapter (Port OUT implementation)
    // Choose adapter based on environment
    {
      provide: EMAIL_PORT,
      useFactory: () => {
        const isProduction = config.env === 'production';

        if (isProduction) {
          console.log('📧 [NotificationModule] Using BrevoAdapter (production)');
          return new BrevoAdapter();
        }

        console.log('📧 [NotificationModule] Using MaildevAdapter (development)');
        return new MaildevAdapter();
      },
    },
  ],
  exports: [
    NOTIFICATION_USE_CASES, // Export use cases for other modules
  ],
})
export class NotificationModule {}
