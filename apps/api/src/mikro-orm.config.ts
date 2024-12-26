import { Options, defineConfig } from '@mikro-orm/postgresql';

const ormConfig: Options = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  dbName: process.env.DB_NAME || 'dropit',
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  debug: process.env.NODE_ENV !== 'production',
});

export default ormConfig;
