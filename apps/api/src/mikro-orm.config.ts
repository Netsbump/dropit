import { Options, defineConfig } from '@mikro-orm/postgresql';

export const devOrmConfig: Options = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  dbName: process.env.DB_NAME || 'dropit',
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  debug: process.env.NODE_ENV !== 'production',
});

export const testOrmConfig: Options = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  dbName: process.env.DB_NAME || 'dropit_test',
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  debug: false,
  // Force la synchronisation du schéma en test
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
  },
  // Permet d'utiliser l'EntityManager global
  allowGlobalContext: true,
});
