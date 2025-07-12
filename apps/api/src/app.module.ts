import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/core/db/db.module';
import { EmailModule } from './modules/core/email/email.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { AuthModule } from './modules/identity/auth/auth.module';
import { OrganizationModule } from './modules/identity/organization/organization.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    DbModule,
    AuthModule.forRootAsync(),
    AthletesModule,
    OrganizationModule,
    EmailModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
