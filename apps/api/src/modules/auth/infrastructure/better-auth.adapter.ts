import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { createAuthConfig } from '../better-auth.config';
import type { BetterAuthInstance } from '../better-auth.config';
import type {
  CustomSessionContext,
  EnrichedSessionResult,
} from '../better-auth.config';
import {
  INotificationUseCases,
  NOTIFICATION_USE_CASES,
} from '../../notification/application/ports/inbound/notification-use-cases.port';
import {
  IOnboardingUseCases,
  ONBOARDING_USE_CASES,
} from '../application/ports/onboarding-use-cases.port';
import {
  IMemberUseCases,
  MEMBER_USE_CASES,
} from '../application/ports/member-use-cases.port';
import {
  IUserUseCases,
  USER_USE_CASES,
} from '../application/ports/user-use-cases.port';
import {
  IAthleteUseCases,
  ATHLETE_USE_CASES,
} from '../../athletes/application/ports/athlete-use-cases.port';
import { organizationRoleSchema, type OrganizationRole } from '@dropit/schemas';
import type { Invitation } from 'better-auth/plugins/organization';

/**
 * BetterAuthAdapter - Adapts the better-auth library for NestJS dependency injection.
 *
 * This adapter is the single entry point for better-auth in the application.
 * It has 3 responsibilities:
 *
 * 1. INITIALIZATION: Configures better-auth at startup with NestJS dependencies
 *    (use cases for business logic, no direct DB access)
 *
 * 2. SINGLETON: Ensures only one better-auth instance exists for the entire app
 *    (via the static initPromise pattern to prevent race conditions)
 *
 * 3. EXPOSURE: Provides access to the better-auth instance for other services
 *    (auth for the HTTP middleware, api for programmatic server-side operations)
 */
@Injectable()
export class BetterAuthAdapter implements OnModuleInit {
  private _auth: BetterAuthInstance | null = null;
  private static initPromise: Promise<void> | null = null;

  constructor(
    @Inject(NOTIFICATION_USE_CASES)
    private notificationUseCase: INotificationUseCases,
    @Inject(ONBOARDING_USE_CASES)
    private onboardingUseCases: IOnboardingUseCases,
    @Inject(MEMBER_USE_CASES) private memberUseCases: IMemberUseCases,
    @Inject(ATHLETE_USE_CASES) private athleteUseCases: IAthleteUseCases,
    @Inject(USER_USE_CASES) private userUseCases: IUserUseCases
  ) {}

  /**
   * NestJS lifecycle hook called automatically when the module starts.
   * Initializes better-auth only once, even if called multiple times.
   */
  async onModuleInit() {
    if (!BetterAuthAdapter.initPromise) {
      BetterAuthAdapter.initPromise = this.initialize().then(() => {
        return;
      });
    }

    await BetterAuthAdapter.initPromise;
  }

  /**
   * Returns true if the email belongs to a super admin (role === 'admin').
   * Used by the better-auth hook to restrict signIn.email to super admins only.
   */
  private async checkIsSuperAdminByEmail(email: string): Promise<boolean> {
    const user = await this.userUseCases.getByEmail(email);
    return user?.role === 'admin';
  }

  /**
   * Enriches the session returned by getSession with organizationRole and athleteId.
   * Called by customSession plugin on each getSession(); no extra DB columns.
   */
  private async enrichSession(
    ctx: CustomSessionContext
  ): Promise<EnrichedSessionResult> {
    const { user, session } = ctx;
    const activeOrganizationId = session.activeOrganizationId;
    const activeOrgId =
      typeof activeOrganizationId === 'string'
        ? activeOrganizationId
        : undefined;
    let organizationRole: OrganizationRole | null = null;
    let athleteId: string | null = null;

    if (user?.id) {
      if (activeOrgId) {
        const rawOrganizationRole = await this.memberUseCases.getMemberRole(
          user.id,
          activeOrgId
        );
        const parsedOrganizationRole =
          organizationRoleSchema.safeParse(rawOrganizationRole);
        organizationRole = parsedOrganizationRole.success
          ? parsedOrganizationRole.data
          : null;
      }
      athleteId = await this.athleteUseCases.getAthleteId(user.id);
    }

    return {
      user: { ...user },
      session: {
        ...session,
        organizationRole,
        athleteId,
      },
    };
  }

  /**
   * Creates and configures the better-auth instance.
   * Injects NestJS dependencies (use cases) into the config
   * so that better-auth hooks can use them.
   */
  private async initialize() {
    if (this._auth) {
      return;
    }

    this._auth = createAuthConfig({
      afterCreateInvitation: async (data: {
        invitation: Invitation;
        inviter: { name: string };
        organization: { id: string; name: string };
      }) => {
        const { isNewUser, hasOtherOrganization } =
          await this.onboardingUseCases.prepareUserForInvitation(
            data.invitation.email,
            data.organization.id
          );

        this.notificationUseCase.sendOrganizationInvitation({
          organizationId: data.organization.id,
          organizationName: data.organization.name,
          invitedBy: data.inviter.name,
          invitationToken: data.invitation.id,
          email: data.invitation.email,
          isNewUser,
          hasOtherOrganization,
        });
      },
      sendVerificationOTP: (data) => {
        this.notificationUseCase.sendOtp({
          otp: data.otp,
          email: data.email,
          type: data.type,
        });
      },
      enrichSession: (ctx) => this.enrichSession(ctx),
      checkIsSuperAdminByEmail: (email) => this.checkIsSuperAdminByEmail(email),
      databaseHooks: {
        session: {
          create: {
            before: async (session) => {
              try {
                const activeOrganizationId =
                  await this.memberUseCases.getActiveOrganizationId(
                    session.userId
                  );
                console.log(
                  '🔧 [BetterAuth Hook] Setting session activeOrganizationId:',
                  {
                    userId: session.userId,
                    activeOrganizationId,
                  }
                );
                return {
                  data: {
                    ...session,
                    activeOrganizationId,
                  },
                };
              } catch (error) {
                console.error(
                  '❌ [BetterAuth Hook] Error setting session data:',
                  error
                );
                return { data: session };
              }
            },
          },
        },
      },
    });
  }

  /**
   * Returns the configured better-auth instance.
   *
   * Used by:
   * - AuthModule: to create the HTTP middleware via toNodeHandler(auth)
   * - AuthGuard: to validate user sessions on protected routes
   */
  get auth() {
    if (!this._auth) {
      console.error(
        'BetterAuthAdapter: BetterAuth not initialized - call onModuleInit first'
      );
      throw new Error(
        'BetterAuthAdapter: BetterAuth not initialized - call onModuleInit first'
      );
    }
    return this._auth;
  }

  /**
   * Shortcut to better-auth's programmatic API.
   *
   * Used for server-side operations without going through HTTP:
   * - api.getSession(): get current user session
   * - api.signOut(): logout a user programmatically
   * - api.listOrganizations(): list user's organizations
   */
  get api() {
    return this.auth.api;
  }
}
