import { Athlete } from '../domain/athlete';
import { generateAthleteId } from '../domain/athlete-id';
import {
  AthleteProfileAlreadyExistsError,
  UserProfileNotFoundError,
} from './errors/athlete.errors';
import type {
  AthleteInvitationCreationInput,
  IAthleteInvitationCreation,
} from './ports/in/athlete-invitation-creation.port';
import type { IAthleteUserProfile } from './ports/out/athlete-user-profile.port';
import type { IAthleteRepository } from './ports/out/athlete.repository.port';

export class AthleteInvitationCreation implements IAthleteInvitationCreation {
  constructor(
    private readonly athleteRepository: IAthleteRepository,
    private readonly athleteUserProfile: IAthleteUserProfile
  ) {}

  async createFromInvitation(
    input: AthleteInvitationCreationInput
  ): Promise<Athlete> {
    const existingUserProfileExists = await this.athleteUserProfile.exists(
      input.userId
    );

    if (!existingUserProfileExists) {
      throw new UserProfileNotFoundError(input.userId);
    }

    const existingAthleteProfile = await this.athleteRepository.findByUserId(
      input.userId
    );

    if (existingAthleteProfile) {
      throw new AthleteProfileAlreadyExistsError(input.userId);
    }

    const athlete = Athlete.create({
      id: generateAthleteId(),
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      birthday: null,
      country: null,
    });

    return this.athleteRepository.add(athlete);
  }
}
