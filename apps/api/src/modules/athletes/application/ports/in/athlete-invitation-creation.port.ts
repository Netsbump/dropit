import type { UserId } from '../../../../../shared/kernel/identity';
import type { Athlete } from '../../../domain/athlete';

export interface AthleteInvitationCreationInput {
  userId: UserId;
  firstName: string;
  lastName: string;
}

export interface IAthleteInvitationCreation {
  createFromInvitation(input: AthleteInvitationCreationInput): Promise<Athlete>;
}

export const ATHLETE_INVITATION_CREATION = Symbol(
  'ATHLETE_INVITATION_CREATION'
);
