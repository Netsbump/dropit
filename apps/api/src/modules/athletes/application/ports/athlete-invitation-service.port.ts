import type { IncomingHttpHeaders } from 'node:http';

export interface InviteAthleteParams {
  email: string;
  organizationId: string;
  headers: IncomingHttpHeaders;
}

export abstract class IAthleteInvitationService {
  abstract inviteUser(params: InviteAthleteParams): Promise<void>;
}

export const ATHLETE_INVITATION_SERVICE = Symbol('ATHLETE_INVITATION_SERVICE');
