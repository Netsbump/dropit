import { Options, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
const config: Options = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port:
    Number(process.env.DB_PORT) ||
    (process.env.NODE_ENV === 'test' ? 5433 : 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  dbName:
    process.env.DB_NAME ||
    (process.env.NODE_ENV === 'test' ? 'dropit_test' : 'dropit'),
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  extensions: [SeedManager],
  debug: process.env.NODE_ENV !== 'production',
  schemaGenerator:
    process.env.NODE_ENV === 'test'
      ? {
          disableForeignKeys: true,
          createForeignKeyConstraints: true,
        }
      : undefined,
  allowGlobalContext: process.env.NODE_ENV === 'test',
});

export default config;
