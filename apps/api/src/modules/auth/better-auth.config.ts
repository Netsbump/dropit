import { BetterAuthOptions, User, betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import { config } from "../../config/env.config";
import { organization, Organization, Invitation } from "better-auth/plugins/organization";
import { ac, owner, admin, member } from "@dropit/permissions";

interface BetterAuthDeps {
  sendVerificationEmail?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => Promise<void>;
  afterCreateInvitation: (
    data: {
      invitation: Invitation
      inviter: User & Record<string, unknown>
      organization: Organization
    }
  ) => Promise<void>;
  databaseHooks?: BetterAuthOptions['databaseHooks'];
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
    user: {
      additionalFields: {
        isSuperAdmin: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false, // don't allow user to set isSuperAdmin
        },
      },
    },
    session: {
      additionalFields: {
        athleteId: {
          type: "string",
          required: false, // null for super admins users
          input: false, // don't allow user to set athleteId
        },
      },
    },

    // === CALLBACKS (delegate to better-auth.adapter) ===
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24 * 10, // 10 days
      sendVerificationEmail: async (data, request) => {
        if (!deps?.sendVerificationEmail) return;
        return deps?.sendVerificationEmail?.(data, request);
      },
    },

    // === HOOKS (delegate to better-auth.adapter) ===
    databaseHooks: deps.databaseHooks,

    // === PLUGINS ===
    plugins: [
      openAPI(),
      organization({
        // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
        ac: ac as any,
        roles: {
          owner,
          admin,
          member,
        },

        organizationHooks: {
          afterCreateInvitation: async (data) => {
            await deps.afterCreateInvitation(data);
          }
        }
      })],
  })
}
