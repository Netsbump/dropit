import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { config } from './env.config';

export const auth = betterAuth({
  secret: config.betterAuth.secret,
  trustedOrigins: config.betterAuth.trustedOrigins,
  database: new Pool({
    connectionString: config.database.connectionString,
  }),
});
