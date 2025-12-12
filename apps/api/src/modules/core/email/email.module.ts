import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EMAIL_SERVICE } from './email.port';
import { BrevoService } from './brevo.service';
import { DevMailService } from './dev-mail.service';
import { config } from '../../../config/env.config';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useFactory: () => {
        const isDevelopment = config.env === 'development';

        if (isDevelopment) {
          console.log('📧 [EmailModule] Using DevMailService (Maildev)');
          return new DevMailService();
        } else {
          console.log('📧 [EmailModule] Using BrevoService (Production)');
          return new BrevoService();
        }
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
