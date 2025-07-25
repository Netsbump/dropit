import { User, betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import { config } from "./env.config";
import { organization } from "better-auth/plugins/organization";
import { ac, owner, admin, member } from "@dropit/permissions";
import { Member } from "../modules/identity/domain/organization/member.entity";
import { EntityManager } from "@mikro-orm/core";

interface BetterAuthOptionsDynamic {
  sendResetPassword?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => Promise<void>;
  sendVerificationEmail?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined
  ) => Promise<void>;
  sendInvitationEmail?: (
    data: {
      id: string;
      email: string;
      inviter: { user: { name: string; email: string } };
      organization: { name: string };
      inviteLink?: string;
    },
    request: Request | undefined
  ) => Promise<void>;
}

export function createAuthConfig(
  options?: BetterAuthOptionsDynamic,
  em?: EntityManager
) {
  return betterAuth({
    secret: config.betterAuth.secret,
    trustedOrigins: config.betterAuth.trustedOrigins,

    // Configuration des cookies HttpOnly
    cookies: {
      enabled: true,
      httpOnly: true, // Empêche l'accès via JavaScript (protection XSS)
      secure: config.env === "production", // HTTPS en prod
      sameSite: "lax", // Protection CSRF de base
      maxAge: 60 * 60 * 24 * 7, // 7 jours (en secondes)
    },

    // Support du Bearer token également (pour le mobile)
    bearerToken: {
      enabled: true,
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
        if (ctx.path === "/auth/login") {
          console.info("before");
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
        },
        // NOUVEAU : Configuration de l'envoi d'email d'invitation
        async sendInvitationEmail(data, request) {
          if (!options?.sendInvitationEmail) {
            console.warn("📧 [BetterAuth] sendInvitationEmail not configured");
            return;
          }

          // Construire le lien d'invitation
          const inviteLink = `${config.appUrl}/accept-invitation/${data.id}`;

          console.log("📧 [BetterAuth] Sending invitation email:", {
            invitationId: data.id,
            email: data.email,
            organization: data.organization.name,
            inviteLink,
          });

          // Appeler la fonction d'envoi d'email configurée
          await options.sendInvitationEmail(
            {
              ...data,
              inviteLink,
            },
            request
          );
        },
      }),
    ],
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            if (!em) return { data: session };
            
            try {
              const emFork = em.fork();
              const memberRecord = await emFork.findOne(Member, { user: { id: session.userId } });
              
              console.log('🔧 [BetterAuth Hook] Setting activeOrganizationId:', {
                userId: session.userId,
                organizationId: memberRecord?.organization.id || null
              });
              
              return {
                data: {
                  ...session,
                  activeOrganizationId: memberRecord?.organization.id ?? null,
                },
              };
            } catch (error) {
              console.error('❌ [BetterAuth Hook] Error setting activeOrganizationId:', error);
              return { data: session };
            }
          },
        },
      },
    },
  });
}

export const auth = createAuthConfig();
