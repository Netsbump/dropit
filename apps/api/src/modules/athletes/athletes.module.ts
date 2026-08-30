import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';

import { AthleteEntity } from '../database/entities/athlete.entity';
import { CompetitorStatusEntity } from '../database/entities/competitor-status.entity';
import { PersonalRecordEntity } from '../database/entities/personal-record.entity';
import { PhysicalMetricEntity } from '../database/entities/physical-metric.entity';
import { Exercise } from '../training/domain/exercise.entity';

import { ATHLETE_COMPETITION_STATUS } from './application/ports/in/athlete-competition-status.port';
import { ATHLETE_PERSONAL_RECORDS } from './application/ports/in/athlete-personal-records.port';
import { ATHLETE_PHYSICAL_METRICS } from './application/ports/in/athlete-physical-metrics.port';
import { ATHLETE_PROFILES } from './application/ports/in/athlete-profiles.port';
import { ATHLETE_INVITATION_CREATION } from './application/ports/in/athlete-invitation-creation.port';

// ports (symboles)
import {
  ATHLETE_READ_REPO,
  ATHLETE_REPO,
  IAthleteReadRepository,
  IAthleteRepository,
} from './application/ports/out/athlete.repository.port';
import {
  COMPETITOR_STATUS_REPO,
  ICompetitorStatusRepository,
} from './application/ports/out/competitor-status.repository.port';
import {
  IPersonalRecordRepository,
  PERSONAL_RECORD_REPO,
} from './application/ports/out/personal-record.repository.port';
import {
  IPhysicalMetricRepository,
  PHYSICAL_METRIC_REPO,
} from './application/ports/out/physical-metric.repository.port';
// MikroORM implementations
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';
import { MikroPersonalRecordRepository } from './infrastructure/mikro-personal-record.repository';
import { MikroPhysicalMetricRepository } from './infrastructure/mikro-physical-metric.repository';

import {
  IMemberUseCases,
  MEMBER_USE_CASES,
} from '../auth/application/ports/member-use-cases.port';
import {
  IUserUseCases,
  USER_USE_CASES,
} from '../auth/application/ports/user-use-cases.port';
import { AuthModule } from '../auth/auth.module';
import { InvitationsModule } from '../invitations/invitations.module';
import {
  EXERCISE_CATALOG as TRAINING_EXERCISE_CATALOG,
  IExerciseCatalog as ITrainingExerciseCatalog,
} from '../training/application/ports/exercise-catalog.port';
import { TrainingModule } from '../training/training.module';
import { AthleteCompetitionStatus } from './application/athlete-competition-status';
import { AthleteInvitationCreation } from './application/athlete-invitation-creation';
import { AthletePersonalRecords } from './application/athlete-personal-records';
import { AthletePhysicalMetrics } from './application/athlete-physical-metrics';
import { AthleteProfiles } from './application/athlete-profiles';
import {
  ATHLETE_ACCESS_POLICY,
  IAthleteAccessPolicy,
} from './application/policies/athlete-access-policy.interface';
import { AthleteAccessPolicy } from './application/policies/athlete-access.policy';
import {
  ATHLETE_USER_PROFILE,
  IAthleteUserProfile,
} from './application/ports/out/athlete-user-profile.port';
import {
  ATHLETE_EXERCISE_CATALOG,
  IExerciseCatalog,
} from './application/ports/out/exercise-catalog.port';
import {
  IOrganizationMembership,
  ORGANIZATION_MEMBERSHIP,
} from './application/ports/out/organization-membership.port';
// Controllers & application services
import { AthleteController } from './http/athlete.controller';
import { CompetitorStatusController } from './http/competitor-status.controller';
import { PersonalRecordController } from './http/personal-record.controller';
import { PhysicalMetricController } from './http/physical-metric.controller';
import { AuthAthleteUserProfileAdapter } from './infrastructure/auth-athlete-user-profile.adapter';
import { AuthOrganizationMembershipAdapter } from './infrastructure/auth-organization-membership.adapter';
import { TrainingExerciseCatalogAdapter } from './infrastructure/training-exercise-catalog.adapter';

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
    PhysicalMetricController,
  ],

  providers: [
    // MikroORM implementations
    MikroAthleteRepository,
    MikroCompetitorStatusRepository,
    MikroPersonalRecordRepository,
    MikroPhysicalMetricRepository,

    // Port to implementation bindings (repositories)
    { provide: ATHLETE_REPO, useClass: MikroAthleteRepository },
    { provide: ATHLETE_READ_REPO, useClass: MikroAthleteRepository },
    {
      provide: COMPETITOR_STATUS_REPO,
      useClass: MikroCompetitorStatusRepository,
    },
    { provide: PERSONAL_RECORD_REPO, useClass: MikroPersonalRecordRepository },
    { provide: PHYSICAL_METRIC_REPO, useClass: MikroPhysicalMetricRepository },

    {
      provide: ORGANIZATION_MEMBERSHIP,
      useFactory: (memberUseCases: IMemberUseCases) => {
        return new AuthOrganizationMembershipAdapter(memberUseCases);
      },
      inject: [MEMBER_USE_CASES],
    },
    {
      provide: ATHLETE_ACCESS_POLICY,
      useFactory: (organizationMembership: IOrganizationMembership) => {
        return new AthleteAccessPolicy(organizationMembership);
      },
      inject: [ORGANIZATION_MEMBERSHIP],
    },
    {
      provide: ATHLETE_EXERCISE_CATALOG,
      useFactory: (trainingExerciseCatalog: ITrainingExerciseCatalog) => {
        return new TrainingExerciseCatalogAdapter(trainingExerciseCatalog);
      },
      inject: [TRAINING_EXERCISE_CATALOG],
    },
    {
      provide: ATHLETE_USER_PROFILE,
      useFactory: (userUseCases: IUserUseCases) => {
        return new AuthAthleteUserProfileAdapter(userUseCases);
      },
      inject: [USER_USE_CASES],
    },

    // Port to implementation bindings
    {
      provide: ATHLETE_PROFILES,
      useFactory: (
        athleteRepo: IAthleteRepository,
        athleteReadRepo: IAthleteReadRepository,
        athleteUserProfile: IAthleteUserProfile,
        organizationMembership: IOrganizationMembership,
        athleteAccessPolicy: IAthleteAccessPolicy
      ) => {
        return new AthleteProfiles(
          athleteRepo,
          athleteReadRepo,
          athleteUserProfile,
          organizationMembership,
          athleteAccessPolicy
        );
      },
      inject: [
        ATHLETE_REPO,
        ATHLETE_READ_REPO,
        ATHLETE_USER_PROFILE,
        ORGANIZATION_MEMBERSHIP,
        ATHLETE_ACCESS_POLICY,
      ],
    },
    {
      provide: ATHLETE_INVITATION_CREATION,
      useFactory: (
        athleteRepo: IAthleteRepository,
        athleteUserProfile: IAthleteUserProfile
      ) => {
        return new AthleteInvitationCreation(athleteRepo, athleteUserProfile);
      },
      inject: [ATHLETE_REPO, ATHLETE_USER_PROFILE],
    },
    {
      provide: ATHLETE_PERSONAL_RECORDS,
      useFactory: (
        personalRecordRepo: IPersonalRecordRepository,
        athleteRepo: IAthleteRepository,
        exerciseCatalog: IExerciseCatalog,
        organizationMembership: IOrganizationMembership,
        athleteAccessPolicy: IAthleteAccessPolicy
      ) => {
        return new AthletePersonalRecords(
          personalRecordRepo,
          athleteRepo,
          exerciseCatalog,
          organizationMembership,
          athleteAccessPolicy
        );
      },
      inject: [
        PERSONAL_RECORD_REPO,
        ATHLETE_REPO,
        ATHLETE_EXERCISE_CATALOG,
        ORGANIZATION_MEMBERSHIP,
        ATHLETE_ACCESS_POLICY,
      ],
    },
    {
      provide: ATHLETE_PHYSICAL_METRICS,
      useFactory: (
        physicalMetricRepo: IPhysicalMetricRepository,
        athleteRepo: IAthleteRepository,
        athleteAccessPolicy: IAthleteAccessPolicy
      ) => {
        return new AthletePhysicalMetrics(
          physicalMetricRepo,
          athleteRepo,
          athleteAccessPolicy
        );
      },
      inject: [PHYSICAL_METRIC_REPO, ATHLETE_REPO, ATHLETE_ACCESS_POLICY],
    },
    {
      provide: ATHLETE_COMPETITION_STATUS,
      useFactory: (
        competitorStatusRepo: ICompetitorStatusRepository,
        athleteRepo: IAthleteRepository,
        organizationMembership: IOrganizationMembership,
        athleteAccessPolicy: IAthleteAccessPolicy
      ) => {
        return new AthleteCompetitionStatus(
          competitorStatusRepo,
          athleteRepo,
          organizationMembership,
          athleteAccessPolicy
        );
      },
      inject: [
        COMPETITOR_STATUS_REPO,
        ATHLETE_REPO,
        ORGANIZATION_MEMBERSHIP,
        ATHLETE_ACCESS_POLICY,
      ],
    },
  ],

  // What other modules can inject
  exports: [
    ATHLETE_REPO,
    ATHLETE_READ_REPO,
    COMPETITOR_STATUS_REPO,
    PERSONAL_RECORD_REPO,
    PHYSICAL_METRIC_REPO,
    ATHLETE_PROFILES,
    ATHLETE_INVITATION_CREATION,
    ATHLETE_PHYSICAL_METRICS,
  ],
})
export class AthletesModule {}
