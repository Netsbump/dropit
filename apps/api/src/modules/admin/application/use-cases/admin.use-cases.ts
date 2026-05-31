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
import {
  IInvitationUseCases,
  INVITATION_USE_CASES,
} from '../../../auth/application/ports/invitation-use-cases.port';

@Injectable()
export class AdminUseCases implements IAdminUseCases {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    @Inject(ADMIN_INVITATION_SERVICE)
    private readonly adminInvitationService: IAdminInvitationService,
    @Inject(INVITATION_USE_CASES)
    private readonly invitationUseCases: IInvitationUseCases
  ) {}

  getUsers() {
    return this.adminRepository.getUsers();
  }

  getInvitations() {
    return this.adminRepository.getPendingInvitations();
  }

  async inviteUser(input: InviteAdminUserInput) {
    await this.invitationUseCases.prepareRecipient(
      input.email,
      input.organizationId,
      {
        firstName: input.firstName,
        lastName: input.lastName,
      }
    );

    await this.adminInvitationService.inviteUser({
      email: input.email,
      organizationId: input.organizationId,
      role: input.organizationRole,
      headers: input.headers,
    });
  }
}
