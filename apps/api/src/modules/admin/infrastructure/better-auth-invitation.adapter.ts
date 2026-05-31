import { Injectable } from '@nestjs/common';
import { BetterAuthAdapter } from '../../auth/infrastructure/better-auth.adapter';
import {
  IAdminInvitationService,
  InviteAdminUserParams,
} from '../application/ports/admin-invitation-service.port';

@Injectable()
export class BetterAuthInvitationAdapter implements IAdminInvitationService {
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async inviteUser(params: InviteAdminUserParams): Promise<void> {
    await this.betterAuthAdapter.api.createInvitation({
      headers: {},
      body: {
        email: params.email,
        role: params.role,
        organizationId: params.organizationId,
      },
    });
  }
}
