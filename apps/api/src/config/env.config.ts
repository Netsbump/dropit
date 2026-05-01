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

// Always use .env file (same file for all environments)
dotenv.config();

export const configValidationSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // API
  API_PORT: z.coerce.number(),

  // App URL
  APP_URL: z.string().default('http://localhost:5173'),

  // Database
  DB_PASSWORD: z.string(),
  DB_USER: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url().optional(),
  BETTER_AUTH_BASE_URL: z.string().url().optional(),
  TRUSTED_ORIGINS: z.string().transform((val) => val.split(',')),

  // Email sender (shared across providers)
  EMAIL_FROM_EMAIL: z.string().default('levasseur.sten@gmail.com'),
  EMAIL_FROM_NAME: z.string().default('Dropit'),

  // Email (Brevo)
  BREVO_API_KEY: z.string().optional(),

  // Email (Maildev)
  MAILDEV_HOST: z.string().default('localhost'),
  MAILDEV_SMTP_PORT: z.coerce.number().default(1025),
  MAILDEV_WEB_PORT: z.coerce.number().default(1080),
  MAILDEV_USER: z.string().optional(),
  MAILDEV_PASS: z.string().optional(),
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
  appUrl: configParsed.data.APP_URL,
  betterAuth: {
    secret: configParsed.data.BETTER_AUTH_SECRET,
    baseUrl:
      configParsed.data.BETTER_AUTH_URL ??
      configParsed.data.BETTER_AUTH_BASE_URL ??
      `http://localhost:${configParsed.data.API_PORT}`,
    trustedOrigins: configParsed.data.TRUSTED_ORIGINS,
  },
  database: {
    host: configParsed.data.DB_HOST,
    port: configParsed.data.DB_PORT,
    user: configParsed.data.DB_USER,
    password: configParsed.data.DB_PASSWORD,
    name: configParsed.data.DB_NAME,
    connectionStringUrl: `postgresql://${configParsed.data.DB_USER}:${configParsed.data.DB_PASSWORD}@${configParsed.data.DB_HOST}:${configParsed.data.DB_PORT}/${configParsed.data.DB_NAME}`,
  },
  email: {
    sender: {
      fromEmail: configParsed.data.EMAIL_FROM_EMAIL,
      fromName: configParsed.data.EMAIL_FROM_NAME,
    },
    brevo: {
      apiKey: configParsed.data.BREVO_API_KEY,
    },
    maildev: {
      host: configParsed.data.MAILDEV_HOST,
      smtpPort: configParsed.data.MAILDEV_SMTP_PORT,
      webPort: configParsed.data.MAILDEV_WEB_PORT,
      user: configParsed.data.MAILDEV_USER,
      pass: configParsed.data.MAILDEV_PASS,
    },
  },
} as const;
