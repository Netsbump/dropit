import { Options, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { config } from './env.config';

const mikroOrmConfig: Options = defineConfig({
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  dbName: config.database.name,
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  extensions: [SeedManager],
  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'MainSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
  },
  debug: config.env !== 'production',
  schemaGenerator:
    config.env === 'test'
      ? {
          disableForeignKeys: true,
          createForeignKeyConstraints: true,
        }
      : undefined,
  allowGlobalContext: config.env === 'test',
});

export default mikroOrmConfig;
