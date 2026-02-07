import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/database/database.module';
import { EmailModule } from './modules/email/email.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    AthletesModule,
    EmailModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
