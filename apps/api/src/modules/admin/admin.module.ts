import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminController } from './interface/controllers/admin.controller';
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
  ADMIN_REPOSITORY as ADMIN_REPOSITORY_TOKEN,
  IAdminRepository,
} from './application/ports/admin.repository.port';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Member,
      Invitation,
      Organization,
      User,
      Athlete,
    ]),
    forwardRef(() => InvitationsModule),
  ],
  controllers: [AdminController],
  providers: [
    // Infrastructure implementations
    MikroAdminRepository,

    // Port -> implementation bindings
    { provide: ADMIN_REPOSITORY, useClass: MikroAdminRepository },
    // Use-case binding
    {
      provide: ADMIN_USE_CASES,
      useFactory: (adminRepository: IAdminRepository) =>
        new AdminUseCases(adminRepository),
      inject: [ADMIN_REPOSITORY_TOKEN],
    },
  ],
})
export class AdminModule {}
