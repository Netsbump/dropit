import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/core/db/db.module';
import { EmailModule } from './modules/core/email/email.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { IdentityModule } from './modules/identity/identity.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    DbModule,
    IdentityModule,
    AthletesModule,
    EmailModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
