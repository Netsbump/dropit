import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Athlete } from './domain/athlete.entity';
import { CompetitorStatus } from './domain/competitor-status.entity';
import { PersonalRecord } from './domain/personal-record.entity';
import { Exercise } from '../training/domain/exercise.entity';

// ports (symboles)
import {
  ATHLETE_REPO,
  IAthleteRepository,
} from './application/ports/athlete.repository.port';
import {
  COMPETITOR_STATUS_REPO,
  ICompetitorStatusRepository,
} from './application/ports/competitor-status.repository.port';
import {
  PERSONAL_RECORD_REPO,
  IPersonalRecordRepository,
} from './application/ports/personal-record.repository.port';
import { ATHLETE_USE_CASES } from './application/ports/athlete-use-cases.port';
import { PERSONAL_RECORD_USE_CASES } from './application/ports/personal-record-use-cases.port';
import { COMPETITOR_STATUS_USE_CASES } from './application/ports/competitor-status-use-cases.port';

// MikroORM implementations
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';
import { MikroPersonalRecordRepository } from './infrastructure/mikro-personal-record.repository';

// Controllers & use-cases
import { AthleteController } from './interface/controllers/athlete.controller';
import { CompetitorStatusController } from './interface/controllers/competitor-status.controller';
import { PersonalRecordController } from './interface/controllers/personal-record.controller';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';
import { AthleteUseCases } from './application/use-cases/athlete-use-cases';
import { PersonalRecordUseCases } from './application/use-cases/personal-record.use-cases';
import { AuthModule } from '../auth/auth.module';
import { TrainingModule } from '../training/training.module';
import {
  USER_USE_CASES,
  IUserUseCases,
} from '../auth/application/ports/user-use-cases.port';
import {
  MEMBER_USE_CASES,
  IMemberUseCases,
} from '../auth/application/ports/member-use-cases.port';
import {
  EXERCISE_REPO,
  IExerciseRepository,
} from '../training/application/ports/exercise.repository.port';

@Module({
  imports: [
    // Custom repositories are also declared here
    MikroOrmModule.forFeature({
      entities: [Athlete, PersonalRecord, CompetitorStatus, Exercise],
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => TrainingModule),
  ],

  controllers: [
    AthleteController,
    CompetitorStatusController,
    PersonalRecordController,
  ],

  providers: [
    // MikroORM implementations
    MikroAthleteRepository,
    MikroCompetitorStatusRepository,
    MikroPersonalRecordRepository,

    // Port to implementation bindings (repositories)
    { provide: ATHLETE_REPO, useClass: MikroAthleteRepository },
    {
      provide: COMPETITOR_STATUS_REPO,
      useClass: MikroCompetitorStatusRepository,
    },
    { provide: PERSONAL_RECORD_REPO, useClass: MikroPersonalRecordRepository },

    // use-cases (concrete implementations)
    AthleteUseCases,
    CompetitorStatusUseCases,
    PersonalRecordUseCases,

    // Port to implementation bindings (use-cases)
    {
      provide: ATHLETE_USE_CASES,
      useFactory: (
        athleteRepo: IAthleteRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases
      ) => {
        return new AthleteUseCases(athleteRepo, userUseCases, memberUseCases);
      },
      inject: [ATHLETE_REPO, USER_USE_CASES, MEMBER_USE_CASES],
    },
    {
      provide: PERSONAL_RECORD_USE_CASES,
      useFactory: (
        personalRecordRepo: IPersonalRecordRepository,
        athleteRepo: IAthleteRepository,
        exerciseRepo: IExerciseRepository,
        memberUseCases: IMemberUseCases
      ) => {
        return new PersonalRecordUseCases(
          personalRecordRepo,
          athleteRepo,
          exerciseRepo,
          memberUseCases
        );
      },
      inject: [
        PERSONAL_RECORD_REPO,
        ATHLETE_REPO,
        EXERCISE_REPO,
        MEMBER_USE_CASES,
      ],
    },
    {
      provide: COMPETITOR_STATUS_USE_CASES,
      useFactory: (
        competitorStatusRepo: ICompetitorStatusRepository,
        athleteRepo: IAthleteRepository,
        memberUseCases: IMemberUseCases
      ) => {
        return new CompetitorStatusUseCases(
          competitorStatusRepo,
          athleteRepo,
          memberUseCases
        );
      },
      inject: [COMPETITOR_STATUS_REPO, ATHLETE_REPO, MEMBER_USE_CASES],
    },
  ],

  // What other modules can inject
  exports: [
    ATHLETE_REPO,
    COMPETITOR_STATUS_REPO,
    PERSONAL_RECORD_REPO,
    ATHLETE_USE_CASES,
  ],
})
export class AthletesModule {}
