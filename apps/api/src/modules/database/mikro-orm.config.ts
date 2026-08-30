import { ReflectMetadataProvider } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { Options, defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { config } from '../../config/env.config';
import { Account } from '../auth/domain/auth/account.entity';
import { Session } from '../auth/domain/auth/session.entity';
import { User } from '../auth/domain/auth/user.entity';
import { Verification } from '../auth/domain/auth/verification.entity';
import { Invitation } from '../auth/domain/organization/invitation.entity';
import { Member } from '../auth/domain/organization/member.entity';
import { Organization } from '../auth/domain/organization/organization.entity';
import { Media } from '../media/media.entity';
import { AthleteTrainingSession } from '../training/domain/athlete-training-session.entity';
import { ComplexCategory } from '../training/domain/complex-category.entity';
import { Complex } from '../training/domain/complex.entity';
import { ExerciseCategory } from '../training/domain/exercise-category.entity';
import { ExerciseComplex } from '../training/domain/exercise-complex.entity';
import { Exercise } from '../training/domain/exercise.entity';
import { TrainingSession } from '../training/domain/training-session.entity';
import { WorkoutCategory } from '../training/domain/workout-category.entity';
import { WorkoutElement } from '../training/domain/workout-element.entity';
import { Workout } from '../training/domain/workout.entity';
import { AthleteEntity } from './entities/athlete.entity';
import { CompetitorStatusEntity } from './entities/competitor-status.entity';
import { PersonalRecordEntity } from './entities/personal-record.entity';
import { PhysicalMetricEntity } from './entities/physical-metric.entity';

const testEntities = [
  Media,
  AthleteEntity,
  CompetitorStatusEntity,
  PersonalRecordEntity,
  PhysicalMetricEntity,
  AthleteTrainingSession,
  ComplexCategory,
  Complex,
  ExerciseCategory,
  ExerciseComplex,
  Exercise,
  TrainingSession,
  WorkoutCategory,
  WorkoutElement,
  Workout,
  Account,
  Session,
  User,
  Verification,
  Invitation,
  Member,
  Organization,
];

type CreateMikroOrmOptions = {
  isTest?: boolean;
} & Options;

export function createMikroOrmOptions(options?: CreateMikroOrmOptions) {
  const { isTest, ...restOptions } = options ?? {};
  const isTestEnvironment = isTest || config.env === 'test';
  const isProduction = config.env === 'production';

  const _options: Options = defineConfig({
    entities: isTestEnvironment ? testEntities : ['./dist/**/*.entity.js'],
    entitiesTs:
      isProduction || isTestEnvironment ? undefined : ['./src/**/*.entity.ts'],
    dbName: config.database.name,
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    metadataProvider: isTestEnvironment
      ? ReflectMetadataProvider
      : isProduction
        ? undefined
        : TsMorphMetadataProvider,
    forceUtcTimezone: true,
    extensions: [SeedManager, Migrator],
    seeder: {
      path: './dist/seeders',
      pathTs: './src/seeders',
      defaultSeeder: 'MainSeeder',
      glob: '!(*.d).{js,ts}',
      emit: 'ts',
      fileName: (className: string) => className,
    },
    migrations: {
      path: './dist/modules/database/migrations',
      pathTs: './src/modules/database/migrations',
      allOrNothing: true,
      disableForeignKeys: false,
    },
    debug: true,
    schemaGenerator: isTestEnvironment
      ? {
          disableForeignKeys: true,
          createForeignKeyConstraints: true,
        }
      : undefined,
    allowGlobalContext: isTestEnvironment,
    ...restOptions,
  });

  return _options;
}

export function createTestMikroOrmOptions(options?: Options) {
  return createMikroOrmOptions({ isTest: true, ...options });
}
export default createMikroOrmOptions;
