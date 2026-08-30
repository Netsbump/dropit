import type { UserId } from '../../../../../shared/kernel/identity';

export interface InvitationAthleteCreationInput {
  userId: UserId;
  firstName: string;
  lastName: string;
}

export interface IInvitationAthleteCreation {
  createAthleteForInvitation(
    input: InvitationAthleteCreationInput
  ): Promise<void>;
}

export const INVITATION_ATHLETE_CREATION = Symbol(
  'INVITATION_ATHLETE_CREATION'
);
