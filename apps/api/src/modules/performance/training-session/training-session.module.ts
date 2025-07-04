import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../members/athlete/domain/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { Workout } from '../../training/workout/workout.entity';
import { WorkoutModule } from '../../training/workout/workout.module';
import { TrainingSessionController } from './training-session.controller';
import { TrainingSession } from './training-session.entity';
import { TrainingSessionPresenter } from './training-session.presenter';
import { TrainingSessionRepository } from './training-session.repository';
import { TrainingSessionService } from './training-session.service';
import { TrainingSessionUseCase } from './training-session.use-case';

@Module({
  imports: [
    MikroOrmModule.forFeature([TrainingSession, Athlete, Workout]),
    AthleteModule,
    WorkoutModule,
  ],
  controllers: [TrainingSessionController],
  providers: [
    TrainingSessionService,
    TrainingSessionRepository,
    TrainingSessionPresenter,
    TrainingSessionUseCase,
  ],
  exports: [TrainingSessionService, TrainingSessionRepository],
})
export class TrainingSessionModule {}
