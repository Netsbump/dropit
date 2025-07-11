import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';

import { Athlete } from '../../athletes/athlete/domain/athlete.entity';
import { Workout } from '../../training/workout/workout.entity';
import { TrainingSession } from './domain/training-session.entity';
import { AthleteTrainingSession } from './domain/athlete-training-session.entity';

import { AthleteModule } from '../../athletes/athlete/athlete.module';
import { OrganizationModule } from '../../identity/organization/organization.module';
import { WorkoutModule } from '../../training/workout/workout.module';

import { TrainingSessionController } from './interface/training-session.controller';

import { TrainingSessionUseCase } from './application/use-cases/training-session.use-case';

import { MikroTrainingSessionRepository } from './infrastructure/mikro-training-session.repository';
import { MikroAthleteTrainingSessionRepository } from './infrastructure/mikro-athlete-training-session.repository';
import { TRAINING_SESSION_REPO } from './application/ports/training-session.repository';
import { ATHLETE_TRAINING_SESSION_REPO } from './application/ports/athlete-training-session.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [TrainingSession,AthleteTrainingSession, Athlete, Workout],
    }),
    forwardRef(() => AthleteModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => WorkoutModule),

  ],
  controllers: [TrainingSessionController],
  providers: [
    // implementations MikroORM
    MikroTrainingSessionRepository,
    MikroAthleteTrainingSessionRepository,

    // use-cases
    TrainingSessionUseCase,

    // liaisons port -> implementation
    { provide: TRAINING_SESSION_REPO,  useClass: MikroTrainingSessionRepository },
    { provide: ATHLETE_TRAINING_SESSION_REPO, useClass: MikroAthleteTrainingSessionRepository },
  ],
  exports: [TRAINING_SESSION_REPO, ATHLETE_TRAINING_SESSION_REPO],
})
export class TrainingSessionModule {}
