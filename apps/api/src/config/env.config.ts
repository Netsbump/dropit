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
  PORT: z.coerce.number(),

  // Database
  DB_PASSWORD: z.string(),
  DB_USER: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),

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
  apiPort: configParsed.data.PORT,
  betterAuth: {
    secret: configParsed.data.BETTER_AUTH_SECRET,
    trustedOrigins: configParsed.data.TRUSTED_ORIGINS,
  },
  database: {
    host: configParsed.data.DB_HOST,
    port: configParsed.data.DB_PORT,
    user: configParsed.data.DB_USER,
    password: configParsed.data.DB_PASSWORD,
    name: configParsed.data.DB_NAME,
    connectionString: `postgresql://${configParsed.data.DB_USER}:${configParsed.data.DB_PASSWORD}@${configParsed.data.DB_HOST}:${configParsed.data.DB_PORT}/${configParsed.data.DB_NAME}`,
  },
} as const;
