import { Migrator } from '@mikro-orm/migrations';
import { Options, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { config } from './env.config';

type CreateMikroOrmOptions = {
  isTest?: boolean;
} & Options;

export function createMikroOrmOptions(options?: CreateMikroOrmOptions) {
  const { isTest, ...restOptions } = options ?? {};
  const isTestEnvironment = isTest || config.env === 'test';

  const _options: Options = defineConfig({
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    dbName: config.database.name,
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
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
      path: './dist/modules/db/migrations',
      pathTs: './src/modules/db/migrations',
      allOrNothing: true,
      disableForeignKeys: false,
    },
    debug: config.env !== 'production',
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
