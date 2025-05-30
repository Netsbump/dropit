import { User, betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import { config } from './env.config';

interface BetterAuthOptionsDynamic {
  sendResetPassword?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => Promise<void>;
  sendVerificationEmail?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => Promise<void>;
}

export function createAuthConfig(options?: BetterAuthOptionsDynamic) {
  return betterAuth({
    secret: config.betterAuth.secret,
    trustedOrigins: config.betterAuth.trustedOrigins,

    // Configuration des cookies HttpOnly
    cookies: {
      enabled: true,
      httpOnly: true, // Empêche l'accès via JavaScript (protection XSS)
      secure: config.env === 'production', // HTTPS en prod
      sameSite: 'lax', // Protection CSRF de base
      maxAge: 60 * 60 * 24 * 7, // 7 jours (en secondes)
    },

    // Support du Bearer token également (pour le mobile)
    bearerToken: {
      enabled: true,
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async (data, request) => {
        if (!options?.sendResetPassword) return;
        return options.sendResetPassword(data, request);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24 * 10, // 10 days
      sendVerificationEmail: async (data, request) => {
        if (!options?.sendVerificationEmail) return;
        return options.sendVerificationEmail(data, request);
      },
    },
    database: new Pool({
      connectionString: config.database.connectionString,
    }),
    advanced: {
      generateId: false,
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Je peux ajouter des logiques personnalisées ici si nécessaire
      }),
    },
    plugins: [openAPI()],
  });
}
