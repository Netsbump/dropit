import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Auth } from 'better-auth';
import { createAuthConfig } from '../better-auth.config';
import type { CustomSessionContext, EnrichedSessionResult } from '../better-auth.config';
import {
  INotificationUseCases,
  NOTIFICATION_USE_CASES,
} from '../../notification/application/ports/inbound/notification-use-cases.port';
import { Athlete } from '../../athletes/domain/athlete.entity';
import { Member } from '../domain/organization/member.entity';
import { EntityManager } from '@mikro-orm/core';

/**
 * BetterAuthAdapter - Adapts the better-auth library for NestJS dependency injection.
 *
 * This adapter is the single entry point for better-auth in the application.
 * It has 3 responsibilities:
 *
 * 1. INITIALIZATION: Configures better-auth at startup with NestJS dependencies
 *    (EntityManager for DB access, INotificationUseCases for sending invitations/notifications)
 *
 * 2. SINGLETON: Ensures only one better-auth instance exists for the entire app
 *    (via the static initPromise pattern to prevent race conditions)
 *
 * 3. EXPOSURE: Provides access to the better-auth instance for other services
 *    (auth for the HTTP middleware, api for programmatic server-side operations)
 */
@Injectable()
export class BetterAuthAdapter implements OnModuleInit {
  private _auth: Auth | null = null;
  private static initPromise: Promise<void> | null = null;

  constructor(
    private em: EntityManager,
    @Inject(NOTIFICATION_USE_CASES) private notificationUseCase: INotificationUseCases,
  ) { }

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
   * Enriches the session returned by getSession with organizationRole and athleteId.
   * Called by customSession plugin on each getSession(); no extra DB columns.
   */
  private async enrichSession(ctx: CustomSessionContext): Promise<EnrichedSessionResult> {
    const { user, session } = ctx;
    const activeOrgId = session.activeOrganizationId as string | undefined;
    let organizationRole: string | null = null;
    let athleteId: string | null = null;
    if (user?.id) {
      if (activeOrgId) {
        const memberRecord = await this.em.findOne(Member, {
          user: { id: user.id },
          organization: { id: activeOrgId },
        });
        organizationRole = memberRecord?.role ?? null;
      }
      const athlete = await this.em.findOne(Athlete, { user: { id: user.id } });
      athleteId = athlete?.id ?? null;
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
   * Injects NestJS dependencies (em, notificationUseCase) into the config
   * so that better-auth hooks can use them.
   */
  private async initialize() {
    if (this._auth) {
      return;
    }

    // Use centralized config and inject dependencies
    this._auth = createAuthConfig({
      afterCreateInvitation: async (data) => {
        return this.notificationUseCase.sendInvitation({
          organizationId: data.organization.id,
          organizationName: data.organization.name,
          invitedBy: data.inviter.id,
          invitationToken: data.invitation.id,
          email: data.invitation.email,
        });
      },
      sendEmailVerificationOTP: async (data) => {
        return this.notificationUseCase.sendOtp({ otp: data.otp, email: data.email, type: data.type })
      },
      enrichSession: (ctx) => this.enrichSession(ctx),
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              try {
                const emFork = this.em.fork();
                const existingAthlete = await emFork.findOne(Athlete, { user: { id: user.id } });
                if (existingAthlete) {
                  console.log('🔧 [BetterAuth Hook] Athlete already exists for user:', user.email);
                  return;
                }

                // Extract first and last name from user.name
                const nameParts = user.name.trim().split(' ');
                const firstName = nameParts[0] || user.name;
                const lastName = nameParts.slice(1).join(' ') || '';

                // Create new athlete profile
                const athlete = emFork.create(Athlete, {
                  firstName,
                  lastName,
                  user: user.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });

                await emFork.persistAndFlush(athlete);
                console.log('🔧 [BetterAuth Hook] Created athlete profile for user:', user.email);
              } catch (error) {
                console.error('❌ [BetterAuth Hook] Error creating athlete profile:', error);
              }
            },
          },
        },
        session: {
          create: {
            before: async (session) => {
              try {
                const emFork = this.em.fork();
                const memberRecord = await emFork.findOne(Member, { user: { id: session.userId } });
                const activeOrganizationId = memberRecord?.organization.id ?? null;
                console.log('🔧 [BetterAuth Hook] Setting session activeOrganizationId:', {
                  userId: session.userId,
                  activeOrganizationId,
                });
                return {
                  data: {
                    ...session,
                    activeOrganizationId,
                  },
                };
              } catch (error) {
                console.error('❌ [BetterAuth Hook] Error setting session data:', error);
                return { data: session };
              }
            },
          },
        },
      },
    }) as unknown as Auth;
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
      throw new Error('BetterAuthAdapter: BetterAuth not initialized - call onModuleInit first');
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
