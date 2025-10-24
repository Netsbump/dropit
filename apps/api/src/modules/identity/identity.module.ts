import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthModule } from '../core/auth/auth.module';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { UserUseCases } from './application/user.use-cases';
import { OrganizationUseCases } from './application/organization.use-cases';
import { MemberUseCases } from './application/member.use-cases';
import { MikroUserRepository } from './infrastructure/orm/mikro-user.repository';
import { USER_REPO, IUserRepository } from './application/ports/user.repository.port';
import { USER_USE_CASES } from './application/ports/user-use-cases.port';
import { MEMBER_USE_CASES } from './application/ports/member-use-cases.port';
import { ORGANIZATION_USE_CASES } from './application/ports/organization-use-cases.port';
import { UserController } from './interface/controllers/user.controller';


// Entities
import { Organization } from './domain/organization/organization.entity';
import { Member } from './domain/organization/member.entity';
import { Invitation } from './domain/organization/invitation.entity';
import { User } from './domain/auth/user.entity';
import { MikroOrganizationRepository } from './infrastructure/orm/mikro-organization.repository';
import { MikroMemberRepository } from './infrastructure/orm/mikro-member.repository';
import { ORGANIZATION_REPO, IOrganizationRepository } from './application/ports/organization.repository.port';
import { MEMBER_REPO, IMemberRepository } from './application/ports/member.repository.port';


/**
 * Module principal d'identité qui gère les organisations et les utilisateurs
 * 
 * Ce module :
 * - Gère les organisations, membres et invitations
 * - Fournit les guards et décorateurs d'authentification
 * - Exporte tous les services nécessaires pour les autres modules
 * 
 * Note: La configuration better-auth est gérée par @/core/auth
 */
@Module({
  imports: [
    AuthModule,
    MikroOrmModule.forFeature([Organization, Member, Invitation, User])
  ],
  controllers: [UserController],
  providers: [
    // implémentations MikroORM
    MikroUserRepository,
    MikroOrganizationRepository,
    MikroMemberRepository,

    // liaisons port -> implémentation (repositories)
    { provide: USER_REPO, useClass: MikroUserRepository },
    { provide: ORGANIZATION_REPO, useClass: MikroOrganizationRepository },
    { provide: MEMBER_REPO, useClass: MikroMemberRepository },

    // use-cases (concrete implementations)
    OrganizationUseCases,
    MemberUseCases,
    UserUseCases,

    // liaisons port -> implémentation (use-cases)
    {
      provide: USER_USE_CASES,
      useFactory: (userRepo: IUserRepository) => {
        return new UserUseCases(userRepo);
      },
      inject: [USER_REPO],
    },
    {
      provide: MEMBER_USE_CASES,
      useFactory: (memberRepo: IMemberRepository) => {
        return new MemberUseCases(memberRepo);
      },
      inject: [MEMBER_REPO],
    },
    {
      provide: ORGANIZATION_USE_CASES,
      useFactory: (organizationRepo: IOrganizationRepository) => {
        return new OrganizationUseCases(organizationRepo);
      },
      inject: [ORGANIZATION_REPO],
    },
    
    // Guard global
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],

  exports: [
    // ce que d'autres modules pourront injecter
    ORGANIZATION_REPO,
    MEMBER_REPO,
    USER_REPO,
    
    // Ports pour les use-cases
    USER_USE_CASES,
    MEMBER_USE_CASES,
    ORGANIZATION_USE_CASES,
    
    // Entities pour les autres modules
    MikroOrmModule.forFeature([Organization, Member, User]),
  ],
})
export class IdentityModule {} 