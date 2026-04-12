import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Global, Module, RequestMethod, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { toNodeHandler } from 'better-auth/node';

// Infrastructure
import { BetterAuthAdapter } from './infrastructure/better-auth.adapter';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { MikroUserRepository } from './infrastructure/orm/mikro-user.repository';
import { MikroOrganizationRepository } from './infrastructure/orm/mikro-organization.repository';
import { MikroMemberRepository } from './infrastructure/orm/mikro-member.repository';
import { MikroInvitationRepository } from './infrastructure/orm/mikro-invitation.repository';

// Application - Use Cases
import { UserUseCases } from './application/user.use-cases';
import { OrganizationUseCases } from './application/organization.use-cases';
import { MemberUseCases } from './application/member.use-cases';
import { OnboardingUseCases } from './application/onboarding.use-cases';

// Application - Ports
import { USER_REPO, IUserRepository } from './application/ports/user.repository.port';
import { ORGANIZATION_REPO, IOrganizationRepository } from './application/ports/organization.repository.port';
import { MEMBER_REPO, IMemberRepository } from './application/ports/member.repository.port';
import { INVITATION_REPO, IInvitationRepository } from './application/ports/invitation.repository.port';
import { USER_USE_CASES, IUserUseCases } from './application/ports/user-use-cases.port';
import { MEMBER_USE_CASES } from './application/ports/member-use-cases.port';
import { ORGANIZATION_USE_CASES } from './application/ports/organization-use-cases.port';
import { ONBOARDING_USE_CASES } from './application/ports/onboarding-use-cases.port';

// Domain - Entities
import { Organization } from './domain/organization/organization.entity';
import { Member } from './domain/organization/member.entity';
import { Invitation } from './domain/organization/invitation.entity';
import { User } from './domain/auth/user.entity';

// Interface
import { UserController } from './interface/controllers/user.controller';
import { OnboardingController } from './interface/controllers/onboarding.controller';

// External modules
import { NotificationModule } from '../notification/notification.module';
import { INotificationUseCases, NOTIFICATION_USE_CASES } from '../notification/application/ports/inbound/notification-use-cases.port';
import { AthletesModule } from '../athletes/athletes.module';
import { ATHLETE_USE_CASES, IAthleteUseCases } from '../athletes/application/ports/athlete-use-cases.port';

/**
 * AuthModule - Main authentication and identity module
 *
 * This module handles everything related to authentication and identity:
 *
 * 1. BETTER-AUTH INTEGRATION
 *    - Initializes BetterAuthAdapter at startup
 *    - Configures HTTP middleware for /auth/* routes (login, signup, session, etc.)
 *    - Better-auth handles its own request parsing and response
 *
 * 2. IDENTITY MANAGEMENT
 *    - Entities: User, Organization, Member, Invitation
 *    - Repositories: MikroORM implementations
 *    - Use-cases: UserUseCases, OrganizationUseCases, MemberUseCases
 *
 * 3. SECURITY
 *    - Global AuthGuard: validates session on all protected routes
 *    - Exports guards and decorators for other modules
 */
@Global()
@Module({
  imports: [
    forwardRef(() => NotificationModule),
    forwardRef(() => AthletesModule),
    MikroOrmModule.forFeature([Organization, Member, Invitation, User]),
  ],
  controllers: [UserController, OnboardingController],
  providers: [
    // Better-auth adapter
    BetterAuthAdapter,

    // MikroORM implementations
    MikroUserRepository,
    MikroOrganizationRepository,
    MikroMemberRepository,
    MikroInvitationRepository,

    // Port -> Implementation bindings (repositories)
    { provide: USER_REPO, useClass: MikroUserRepository },
    { provide: ORGANIZATION_REPO, useClass: MikroOrganizationRepository },
    { provide: MEMBER_REPO, useClass: MikroMemberRepository },
    { provide: INVITATION_REPO, useClass: MikroInvitationRepository },

    // Use-cases (concrete implementations)
    UserUseCases,
    OrganizationUseCases,
    MemberUseCases,

    // Port -> Implementation bindings (use-cases)
    {
      provide: USER_USE_CASES,
      useFactory: (userRepo: IUserRepository) => new UserUseCases(userRepo),
      inject: [USER_REPO],
    },
    {
      provide: MEMBER_USE_CASES,
      useFactory: (memberRepo: IMemberRepository) => new MemberUseCases(memberRepo),
      inject: [MEMBER_REPO],
    },
    {
      provide: ORGANIZATION_USE_CASES,
      useFactory: (organizationRepo: IOrganizationRepository) => new OrganizationUseCases(organizationRepo),
      inject: [ORGANIZATION_REPO],
    },
    {
      provide: ONBOARDING_USE_CASES,
      useFactory: (
        notificationUseCases: INotificationUseCases,
        invitationRepo: IInvitationRepository,
        memberRepo: IMemberRepository,
        userUseCases: IUserUseCases,
        athleteUseCases: IAthleteUseCases,
      ) => new OnboardingUseCases(notificationUseCases, invitationRepo, memberRepo, userUseCases, athleteUseCases),
      inject: [NOTIFICATION_USE_CASES, INVITATION_REPO, MEMBER_REPO, USER_USE_CASES, ATHLETE_USE_CASES],
    },

    // Global guard - validates session on all routes
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [
    // Better-auth adapter for other modules that need session info
    BetterAuthAdapter,

    // Repositories
    USER_REPO,
    ORGANIZATION_REPO,
    MEMBER_REPO,

    // Use-cases
    USER_USE_CASES,
    MEMBER_USE_CASES,
    ORGANIZATION_USE_CASES,

    // Entities for other modules
    MikroOrmModule.forFeature([Organization, Member, User]),
  ],
})
export class AuthModule implements NestModule {
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  /**
   * Configure the better-auth HTTP middleware.
   *
   * Forces better-auth initialization before registering the handler,
   * so the handler is bound once to the real auth instance at startup.
   *
   * Better-auth handles: POST /auth/sign-up, POST /auth/sign-in,
   * GET /auth/session, POST /auth/sign-out, etc.
   *
   * Note: The body parser is skipped for these routes in main.ts
   * because better-auth needs to parse the raw body itself.
   */
  async configure(consumer: MiddlewareConsumer) {
    await this.betterAuthAdapter.onModuleInit();

    const handler = toNodeHandler(this.betterAuthAdapter.auth);

    consumer
      .apply(handler)
      .forRoutes({
        path: '/auth/*',
        method: RequestMethod.ALL,
      });
  }
}
