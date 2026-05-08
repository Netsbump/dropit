import { RequestAccessInput } from "@dropit/schemas";

export interface IOnboardingUseCases {
  createCoachAccessRequest(data: RequestAccessInput): Promise<void>;
  acceptInvitation(invitationId: string): Promise<void>;
  prepareUserForInvitation(email: string, organizationId: string): Promise<{ isNewUser: boolean; hasOtherOrganization: boolean }>;
}

export const ONBOARDING_USE_CASES = Symbol('ONBOARDING_USE_CASES');
