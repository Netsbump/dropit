import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { BetterAuthAdapter } from '../../auth/infrastructure/better-auth.adapter';
import {
  IAthleteInvitationService,
  InviteAthleteParams,
} from '../application/ports/athlete-invitation-service.port';

@Injectable()
export class BetterAuthAthleteInvitationAdapter
  implements IAthleteInvitationService
{
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async inviteUser(params: InviteAthleteParams): Promise<void> {
    await this.betterAuthAdapter.api.createInvitation({
      headers: fromNodeHeaders(params.headers),
      body: {
        email: params.email,
        role: 'member',
        organizationId: params.organizationId,
      },
    });
  }
}
