import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/database/database.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    AthletesModule,
    NotificationModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
