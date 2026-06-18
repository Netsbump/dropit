import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { BetterAuthAdapter } from '../../auth/infrastructure/better-auth.adapter';
import {
  CreateInvitationParams,
  IInvitationAuthProvider,
} from '../application/ports/invitation-auth-provider.port';

@Injectable()
export class BetterAuthInvitationProviderAdapter
  implements IInvitationAuthProvider
{
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async createInvitation(params: CreateInvitationParams): Promise<void> {
    await this.betterAuthAdapter.api.createInvitation({
      headers: fromNodeHeaders(params.headers),
      body: {
        email: params.email,
        role: params.organizationRole,
        organizationId: params.organizationId,
      },
    });
  }
}
