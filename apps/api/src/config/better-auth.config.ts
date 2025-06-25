import { User, betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import { config } from './env.config';
import { UserRole } from '../modules/members/auth/auth.entity';
import { organization } from 'better-auth/plugins/organization';
import { ac, owner, admin, member } from '@dropit/permissions';


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

    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: true,
          defaultValue: UserRole.ATHLETE,
          input: false, // don't allow user to set role
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async (data, request) => {
        if (!options?.sendResetPassword) return;
        return options?.sendResetPassword?.(data, request);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24 * 10, // 10 days
      sendVerificationEmail: async (data, request) => {
        if (!options?.sendVerificationEmail) return;
        return options?.sendVerificationEmail?.(data, request);
      },
    },
    database: new Pool({
      connectionString: config.database.connectionStringUrl,
    }),
    advanced: {
      database: {
        generateId: false, // Fix pour Better Auth 1.2.7 - nouvelle syntaxe
      },
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === '/auth/login') {
          console.info('before');
        }
      }),
    },
    plugins: [
      openAPI(), 
      organization({
        // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
        ac: ac as any,
        roles: {
          owner,
          admin,
          member,
        }
      })
    ],
  });
}

export const auth = createAuthConfig();
