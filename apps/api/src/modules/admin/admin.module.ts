import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminController } from './interface/controllers/admin.controller';
import { ADMIN_INVITATION_SERVICE } from './application/ports/admin-invitation-service.port';
import { BetterAuthInvitationAdapter } from './infrastructure/better-auth-invitation.adapter';
import { Member } from '../auth/domain/organization/member.entity';
import { Invitation } from '../auth/domain/organization/invitation.entity';
import { Organization } from '../auth/domain/organization/organization.entity';
import { User } from '../auth/domain/auth/user.entity';
import { Athlete } from '../athletes/domain/athlete.entity';
import { MikroAdminRepository } from './infrastructure/mikro-admin.repository';
import { ADMIN_REPOSITORY } from './application/ports/admin.repository.port';
import { AdminUseCases } from './application/use-cases/admin.use-cases';
import { ADMIN_USE_CASES } from './application/ports/admin-use-cases.port';
import {
  INVITATION_USE_CASES,
  IInvitationUseCases,
} from '../auth/application/ports/invitation-use-cases.port';
import {
  ADMIN_REPOSITORY as ADMIN_REPOSITORY_TOKEN,
  IAdminRepository,
} from './application/ports/admin.repository.port';
import {
  ADMIN_INVITATION_SERVICE as ADMIN_INVITATION_SERVICE_TOKEN,
  IAdminInvitationService,
} from './application/ports/admin-invitation-service.port';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Member,
      Invitation,
      Organization,
      User,
      Athlete,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    // Infrastructure implementations
    BetterAuthInvitationAdapter,
    MikroAdminRepository,

    // Port -> implementation bindings
    { provide: ADMIN_REPOSITORY, useClass: MikroAdminRepository },
    {
      provide: ADMIN_INVITATION_SERVICE,
      useClass: BetterAuthInvitationAdapter,
    },

    // Use-case binding
    {
      provide: ADMIN_USE_CASES,
      useFactory: (
        adminRepository: IAdminRepository,
        adminInvitationService: IAdminInvitationService,
        invitationUseCases: IInvitationUseCases
      ) =>
        new AdminUseCases(
          adminRepository,
          adminInvitationService,
          invitationUseCases
        ),
      inject: [
        ADMIN_REPOSITORY_TOKEN,
        ADMIN_INVITATION_SERVICE_TOKEN,
        INVITATION_USE_CASES,
      ],
    },
  ],
})
export class AdminModule {}
