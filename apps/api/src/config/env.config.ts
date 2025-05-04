import { join } from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Environment configuration
 *
 * Uses process.cwd() to get the project root directory regardless of where
 * the application is executed from. This ensures environment files can always
 * be located correctly even when run from different contexts.
 *
 * The path.join() function creates proper absolute paths to .env files,
 * handling OS-specific path separators correctly.
 */
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'test') {
  dotenv.config({ path: join(process.cwd(), '.env.test') });
} else {
  dotenv.config();
}

export const configValidationSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // API
  API_PORT: z.coerce.number(),

  // Database
  DATABASE_PASSWORD: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string(),
  TRUSTED_ORIGINS: z.string().transform((val) => val.split(',')),
});

export type ConfigSchema = z.infer<typeof configValidationSchema>;

export const configParsed = configValidationSchema.safeParse(process.env);

if (!configParsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(
      configParsed.error.format(),
      null,
      4
    )}`
  );
}

export const config = {
  env: configParsed.data.NODE_ENV,
  apiPort: configParsed.data.API_PORT,
  betterAuth: {
    secret: configParsed.data.BETTER_AUTH_SECRET,
    trustedOrigins: configParsed.data.TRUSTED_ORIGINS,
  },
  database: {
    host: configParsed.data.DATABASE_HOST,
    port: configParsed.data.DATABASE_PORT,
    user: configParsed.data.DATABASE_USER,
    password: configParsed.data.DATABASE_PASSWORD,
    name: configParsed.data.DATABASE_NAME,
    connectionString: `postgresql://${configParsed.data.DATABASE_USER}:${configParsed.data.DATABASE_PASSWORD}@${configParsed.data.DATABASE_HOST}:${configParsed.data.DATABASE_PORT}/${configParsed.data.DATABASE_NAME}`,
  },
} as const;
