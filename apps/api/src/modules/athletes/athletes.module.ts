import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AthleteEntity } from '../database/entities/athlete.entity';
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
import { ATHLETE_PROFILES } from './application/ports/athlete-profiles.port';
import { PERSONAL_RECORD_USE_CASES } from './application/ports/personal-record-use-cases.port';
import { COMPETITOR_STATUS_USE_CASES } from './application/ports/competitor-status-use-cases.port';

// MikroORM implementations
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';
import { MikroPersonalRecordRepository } from './infrastructure/mikro-personal-record.repository';

// Controllers & application services
import { AthleteController } from './interface/controllers/athlete.controller';
import { CompetitorStatusController } from './interface/controllers/competitor-status.controller';
import { PersonalRecordController } from './interface/controllers/personal-record.controller';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';
import { AthleteProfiles } from './application/athlete-profiles';
import { PersonalRecordUseCases } from './application/use-cases/personal-record.use-cases';
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
      entities: [AthleteEntity, PersonalRecord, CompetitorStatus, Exercise],
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

    // Application services still registered directly for legacy use-cases
    CompetitorStatusUseCases,
    PersonalRecordUseCases,

    // Port to implementation bindings
    {
      provide: ATHLETE_PROFILES,
      useFactory: (
        athleteRepo: IAthleteRepository,
        userUseCases: IUserUseCases,
        memberUseCases: IMemberUseCases,
        athleteAccessPolicy: AthleteAccessPolicy
      ) => {
        return new AthleteProfiles(
          athleteRepo,
          userUseCases,
          memberUseCases,
          athleteAccessPolicy
        );
      },
      inject: [
        ATHLETE_REPO,
        USER_USE_CASES,
        MEMBER_USE_CASES,
        AthleteAccessPolicy,
      ],
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
    ATHLETE_PROFILES,
  ],
})
export class AthletesModule {}
