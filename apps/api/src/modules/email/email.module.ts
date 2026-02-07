import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EMAIL_SERVICE } from './email.port';
import { BrevoService } from './brevo.service';
import { DevMailService } from './dev-mail.service';
import { config } from '../../config/env.config';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useFactory: () => {
        const isProduction = config.env === 'production';

        if (isProduction) {
          console.log('📧 [EmailModule] Using BrevoService (Production)');
          return new BrevoService();
        }
        console.log('📧 [EmailModule] Using DevMailService (Development/Test)');
        return new DevMailService();
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
