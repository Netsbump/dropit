import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../members/athlete/domain/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { TrainingSession } from '../training-session/domain/training-session.entity';
import { TrainingSessionModule } from '../training-session/training-session.module';
import { AthleteTrainingSessionController } from './interface/athlete-training-session.controller';
import { AthleteTrainingSession } from './domain/athlete-training-session.entity';
import { AthleteTrainingSessionUseCases } from './application/athlete-training-session.use-cases';

@Module({
  imports: [
    MikroOrmModule.forFeature([AthleteTrainingSession, Athlete, TrainingSession]),
    AthleteModule,
    TrainingSessionModule,
  ],
  controllers: [AthleteTrainingSessionController],
  providers: [AthleteTrainingSessionUseCases],
  exports: [AthleteTrainingSessionUseCases],
})
export class AthleteTrainingSessionModule {}
