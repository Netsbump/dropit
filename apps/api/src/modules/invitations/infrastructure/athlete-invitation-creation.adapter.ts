import { Inject, Injectable } from '@nestjs/common';
import {
  ATHLETE_INVITATION_CREATION,
  IAthleteInvitationCreation,
} from '../../athletes/application/ports/in/athlete-invitation-creation.port';
import {
  IInvitationAthleteCreation,
  InvitationAthleteCreationInput,
} from '../application/ports/out/invitation-athlete-creation.port';

@Injectable()
export class AthleteInvitationCreationAdapter
  implements IInvitationAthleteCreation
{
  constructor(
    @Inject(ATHLETE_INVITATION_CREATION)
    private readonly athleteInvitationCreation: IAthleteInvitationCreation
  ) {}

  async createAthleteForInvitation(
    input: InvitationAthleteCreationInput
  ): Promise<void> {
    await this.athleteInvitationCreation.createFromInvitation(input);
  }
}
