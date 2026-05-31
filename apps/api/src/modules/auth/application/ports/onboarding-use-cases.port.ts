import { RequestAccessInput } from '@dropit/schemas';
import type { InvitableOrganizationRole } from '@dropit/schemas';

export interface IOnboardingUseCases {
  createCoachAccessRequest(data: RequestAccessInput): Promise<void>;
  acceptInvitation(invitationId: string): Promise<InvitableOrganizationRole>;
}

export const ONBOARDING_USE_CASES = Symbol('ONBOARDING_USE_CASES');
