import { BetterAuthOptions, User, betterAuth } from "better-auth";
import { openAPI, admin, customSession, emailOTP, EmailOTPOptions } from "better-auth/plugins";
import { Pool } from "pg";
import { config } from "../../config/env.config";
import { organization, Organization, Invitation } from "better-auth/plugins/organization";

export type SendVerificationOTP = Parameters<EmailOTPOptions["sendVerificationOTP"]>[0];

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
  sendVerificationUserEmail: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => void;
  afterCreateInvitation: (data: {
    invitation: Invitation;
    inviter: User;
    organization: Organization;
  }) => void;
  sendVerificationOTP: (data: SendVerificationOTP) => void;
  enrichSession: (ctx: CustomSessionContext) => Promise<EnrichedSessionResult>;
  databaseHooks: BetterAuthOptions["databaseHooks"];
}

export function createAuthConfig(
  deps: BetterAuthDeps
) {
  return betterAuth({
    // === STATIC (env.config) ===
    secret: config.betterAuth.secret,
    trustedOrigins: config.betterAuth.trustedOrigins,
    // cookies configuration HttpOnly
    cookies: {
      enabled: true,
      httpOnly: true, // restrict javascript access (XSS protect)
      secure: config.env === "production", // HTTPS in prod
      sameSite: "lax", // CRSF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    },
    // Support bearer token only for mobile app
    bearerToken: {
      enabled: true,
    },
    database: new Pool({
      connectionString: config.database.connectionStringUrl,
    }),
    advanced: {
      database: {
        generateId: false, // Fix for Better Auth 1.2.7 - new synthax
      },
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    emailAndPassword: {
      enabled: true,
    },

    // === CALLBACKS CORE (delegate to better-auth.adapter) ===
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24 * 10, // 10 days
      sendVerificationEmail: async (data, request) => {
        deps.sendVerificationUserEmail(data, request);
      },
    },

    // === HOOKS CORE (delegate to better-auth.adapter) ===
    databaseHooks: deps.databaseHooks,

    // === PLUGINS ===
    plugins: [
      openAPI(),
      admin(),
      emailOTP({
        async sendVerificationOTP(data) {
          deps.sendVerificationOTP(data);
        }
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
  })
}
