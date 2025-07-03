import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../members/athlete/domain/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { TrainingSession } from '../training-session/training-session.entity';
import { TrainingSessionModule } from '../training-session/training-session.module';
import { AthleteTrainingSessionController } from './athlete-training-session.controller';
import { AthleteTrainingSession } from './athlete-training-session.entity';
import { AthleteTrainingSessionService } from './athlete-training-session.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([AthleteTrainingSession, Athlete, TrainingSession]),
    AthleteModule,
    TrainingSessionModule,
  ],
  controllers: [AthleteTrainingSessionController],
  providers: [AthleteTrainingSessionService],
  exports: [AthleteTrainingSessionService],
})
export class AthleteTrainingSessionModule {}
