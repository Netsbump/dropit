import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthModule } from '../core/auth/auth.module';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { UserUseCases } from './application/user.use-cases';
import { OrganizationUseCases } from './application/organization.use-cases';
import { MemberUseCases } from './application/member.use-cases';
import { MikroUserRepository } from './infrastructure/orm/mikro-user.repository';
import { USER_REPO } from './application/ports/user.repository';
import { IdentityInterfaceModule } from './interface/interface.module';

// Entities
import { Organization } from './domain/organization/organization.entity';
import { Member } from './domain/organization/member.entity';
import { Invitation } from './domain/organization/invitation.entity';
import { User } from './domain/auth/user.entity';
import { MikroOrganizationRepository } from './infrastructure/orm/mikro-organization.repository';
import { MikroMemberRepository } from './infrastructure/orm/mikro-member.repository';
import { ORGANIZATION_REPO } from './application/ports/organization.repository'
import { MEMBER_REPO } from './application/ports/member.repository';


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
    IdentityInterfaceModule,
    MikroOrmModule.forFeature([Organization, Member, Invitation, User])
  ],
  providers: [
    // Use-cases
    OrganizationUseCases,
    MemberUseCases,
    UserUseCases,

    // MikroORM Repositories
    MikroUserRepository,
    MikroOrganizationRepository,
    MikroMemberRepository,

    { provide: USER_REPO, useClass: MikroUserRepository },
    { provide: ORGANIZATION_REPO, useClass: MikroOrganizationRepository },
    { provide: MEMBER_REPO, useClass: MikroMemberRepository },
    
    // Guard global
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
    // Use-cases
    OrganizationUseCases,
    MemberUseCases,
    UserUseCases,

    // ce que d'autres modules pourront injecter
    ORGANIZATION_REPO,
    MEMBER_REPO,
    USER_REPO,
    
    // Entities pour les autres modules
    MikroOrmModule.forFeature([Organization, Member, User]),
  ],
})
export class IdentityModule {} 