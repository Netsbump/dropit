import { Inject, Injectable } from '@nestjs/common';
import {
  ADMIN_REPOSITORY,
  IAdminRepository,
} from '../ports/admin.repository.port';
import {
  ADMIN_INVITATION_SERVICE,
  IAdminInvitationService,
} from '../ports/admin-invitation-service.port';
import {
  IAdminUseCases,
  InviteAdminUserInput,
} from '../ports/admin-use-cases.port';

@Injectable()
export class AdminUseCases implements IAdminUseCases {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    @Inject(ADMIN_INVITATION_SERVICE)
    private readonly adminInvitationService: IAdminInvitationService
  ) {}

  getUsers() {
    return this.adminRepository.getUsers();
  }

  getInvitations() {
    return this.adminRepository.getPendingInvitations();
  }

  async inviteUser(input: InviteAdminUserInput) {
    await this.adminInvitationService.inviteUser({
      email: input.email,
      organizationId: input.organizationId,
      role: input.organizationRole,
    });
  }
}
