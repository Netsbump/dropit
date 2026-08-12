import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AthleteEntity } from '../database/entities/athlete.entity';
import { CompetitorStatusEntity } from '../database/entities/competitor-status.entity';
import { PersonalRecordEntity } from '../database/entities/personal-record.entity';
import { PhysicalMetricEntity } from '../database/entities/physical-metric.entity';
import { Exercise } from '../training/domain/exercise.entity';

// ports (symboles)
import {
  ATHLETE_READ_REPO,
  ATHLETE_REPO,
  IAthleteReadRepository,
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
import { ATHLETE_PROFILES } from './application/ports/athlete-profiles.port';
import { ATHLETE_PERSONAL_RECORDS } from './application/ports/athlete-personal-records.port';
import { ATHLETE_COMPETITION_STATUS } from './application/ports/athlete-competition-status.port';

// MikroORM implementations
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';
import { MikroPersonalRecordRepository } from './infrastructure/mikro-personal-record.repository';

// Controllers & application services
import { AthleteController } from './http/athlete.controller';
import { CompetitorStatusController } from './http/competitor-status.controller';
import { PersonalRecordController } from './http/personal-record.controller';
import { AthleteCompetitionStatus } from './application/athlete-competition-status';
import { AthleteProfiles } from './application/athlete-profiles';
import { AthletePersonalRecords } from './application/athlete-personal-records';
import { AthleteAccessPolicy } from './application/policies/athlete-access.policy';
import { AuthModule } from '../auth/auth.module';
import { TrainingModule } from '../training/training.module';
import { InvitationsModule } from '../invitations/invitations.module';
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
      entities: [
        AthleteEntity,
        PersonalRecordEntity,
        CompetitorStatusEntity,
        PhysicalMetricEntity,
        Exercise,
      ],
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => InvitationsModule),
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
    { provide: ATHLETE_READ_REPO, useClass: MikroAthleteRepository },
    {
      provide: COMPETITOR_STATUS_REPO,
      useClass: MikroCompetitorStatusRepository,
    },
    { provide: PERSONAL_RECORD_REPO, useClass: MikroPersonalRecordRepository },

    {
      provide: AthleteAccessPolicy,
      useFactory: (memberUseCases: IMemberUseCases) => {
        return new AthleteAccessPolicy(memberUseCases);
      },
      inject: [MEMBER_USE_CASES],
    },

    // Application services still registered directly
    AthleteCompetitionStatus,
    AthletePersonalRecords,

    // Port to implementation bindings
    {
      provide: ATHLETE_PROFILES,
      useFactory: (
        athleteRepo: IAthleteRepository,
        athleteReadRepo: IAthleteReadRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases,
        athleteAccessPolicy: AthleteAccessPolicy
      ) => {
        return new AthleteProfiles(
          athleteRepo,
          athleteReadRepo,
          userUseCases,
          memberUseCases,
          athleteAccessPolicy
        );
      },
      inject: [
        ATHLETE_REPO,
        ATHLETE_READ_REPO,
        USER_USE_CASES,
        MEMBER_USE_CASES,
        AthleteAccessPolicy,
      ],
    },
    {
      provide: ATHLETE_PERSONAL_RECORDS,
      useFactory: (
        personalRecordRepo: IPersonalRecordRepository,
        athleteRepo: IAthleteRepository,
        exerciseRepo: IExerciseRepository,
        memberUseCases: IMemberUseCases
      ) => {
        return new AthletePersonalRecords(
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
      provide: ATHLETE_COMPETITION_STATUS,
      useFactory: (
        competitorStatusRepo: ICompetitorStatusRepository,
        athleteRepo: IAthleteRepository,
        memberUseCases: IMemberUseCases
      ) => {
        return new AthleteCompetitionStatus(
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
    ATHLETE_READ_REPO,
    COMPETITOR_STATUS_REPO,
    PERSONAL_RECORD_REPO,
    ATHLETE_PROFILES,
  ],
})
export class AthletesModule {}
