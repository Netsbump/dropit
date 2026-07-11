import { BetterAuthOptions, User, betterAuth } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import {
  openAPI,
  admin,
  customSession,
  emailOTP,
  bearer,
  EmailOTPOptions,
} from 'better-auth/plugins';
import { Pool } from 'pg';
import { config } from '../../config/env.config';
import {
  organization,
  Organization,
  Invitation,
} from 'better-auth/plugins/organization';

export type SendVerificationOTP = Parameters<
  EmailOTPOptions['sendVerificationOTP']
>[0];

/** Context passed by customSession plugin (user + session from DB) */
export interface CustomSessionContext {
  user: User;
  session: Record<string, unknown>;
}

/** Return shape: session can be extended with organizationRole, athleteId, etc. */
export interface EnrichedSessionResult {
  user: Record<string, unknown>;
  session: Record<string, unknown>;
}

interface BetterAuthDeps {
  afterCreateInvitation: (data: {
    invitation: Invitation;
    inviter: User;
    organization: Organization;
  }) => void;
  sendVerificationOTP: (data: SendVerificationOTP) => void;
  enrichSession: (ctx: CustomSessionContext) => Promise<EnrichedSessionResult>;
  /** Returns true if the email belongs to a super admin (role === 'admin'). */
  checkIsSuperAdminByEmail: (email: string) => Promise<boolean>;
  databaseHooks: BetterAuthOptions['databaseHooks'];
}

export type BetterAuthInstance = {
  api: {
    getSession: (params: { headers: Headers }) => Promise<{
      user?: unknown;
      session?: unknown;
    } | null>;
    createInvitation: (params: {
      headers: Headers;
      body: {
        email: string;
        role: string;
        organizationId: string;
      };
    }) => Promise<unknown>;
  };
  handler: (request: Request) => Promise<Response>;
};

export function createAuthConfig(deps: BetterAuthDeps): BetterAuthInstance {
  return betterAuth({
    // === STATIC (env.config) ===
    secret: config.betterAuth.secret,
    baseURL: config.betterAuth.baseUrl,
    trustedOrigins: config.betterAuth.trustedOrigins,
    database: new Pool({
      connectionString: config.database.connectionStringUrl,
    }),
    advanced: {
      database: {
        generateId: false,
      },
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    // Disable unused routes to reduce attack surface and prevent email enumeration
    disabledPaths: [
      '/email-otp/check-verification-otp',
      '/email-otp/verify-email',
      '/sign-up/email',
    ],

    // Restrict signIn.email to super admins only (role === 'admin').
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/email') return;

        const body = ctx.body as { email?: string } | undefined;
        if (!body?.email) return;

        const isSuperAdmin = await deps.checkIsSuperAdminByEmail(body.email);
        if (!isSuperAdmin) {
          throw new APIError('FORBIDDEN', {
            message: 'Password sign-in is restricted to admin accounts',
          });
        }
      }),
    },

    // === HOOKS CORE (delegate to better-auth.adapter) ===
    databaseHooks: deps.databaseHooks,

    // === PLUGINS ===
    plugins: [
      openAPI(),
      admin(),
      bearer(), // Support bearer token for mobile app
      emailOTP({
        disableSignUp: true,
        async sendVerificationOTP(data) {
          deps.sendVerificationOTP(data);
        },
      }),
      organization({
        allowUserToCreateOrganization: async (user) => {
          return user.role === 'admin';
        },
        organizationHooks: {
          afterCreateInvitation: async (data) => {
            deps.afterCreateInvitation(data);
          },
        },
      }),
      customSession(async (ctx) => deps.enrichSession(ctx)),
    ],
  }) as unknown as BetterAuthInstance;
}
