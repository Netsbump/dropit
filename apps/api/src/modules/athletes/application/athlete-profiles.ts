import {
  Athlete,
  AthleteDomainError,
  type AthleteCreation,
  type AthleteUpdate,
} from '../domain/athlete';
import type { IAthleteProfiles } from './ports/in/athlete-profiles.port';
import type { AthleteDetailsReadModel } from './read-models/athlete-details.read-model';
import {
  IAthleteRepository,
  IAthleteReadRepository,
} from './ports/out/athlete.repository.port';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import { IOrganizationMembership } from './ports/out/organization-membership.port';
import {
  AthleteNotFoundError,
  UserNotFoundError,
  AthleteAlreadyExistsError,
  InvalidAthleteCreationError,
  InvalidAthleteStateError,
  UserDoesNotBelongToOrganizationError,
} from './errors/athlete.errors';
import { IAthleteUserProfile } from './ports/out/athlete-user-profile.port';
import type { AthleteId } from '../domain/athlete-id';

export class AthleteProfiles implements IAthleteProfiles {
  constructor(
    private readonly athleteRepository: IAthleteRepository,
    private readonly athleteReadRepository: IAthleteReadRepository,
    private readonly athleteUserProfile: IAthleteUserProfile,
    private readonly organizationMembership: IOrganizationMembership,
    private readonly athleteAccessPolicy: IAthleteAccessPolicy
  ) {}

  private async getAthleteOrThrow(athleteId: AthleteId): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundError(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getAuthorizedAthleteUserIds(
    currentUserId: string,
    organizationId: string
  ): Promise<string[]> {
    const [isUserCoach, athleteUserIds] = await Promise.all([
      this.organizationMembership.isCoach(currentUserId, organizationId),
      this.organizationMembership.listAthleteUserIds(organizationId),
    ]);
    const isUserAthlete = athleteUserIds.includes(currentUserId);

    if (!isUserCoach && !isUserAthlete) {
      throw new UserDoesNotBelongToOrganizationError(
        'User does not belong to this organization'
      );
    }

    return athleteUserIds;
  }

  private toInvalidAthleteCreationError(error: unknown): never {
    if (error instanceof AthleteDomainError) {
      throw new InvalidAthleteCreationError(error.message);
    }

    throw error;
  }

  private toInvalidAthleteStateError(error: unknown): never {
    if (error instanceof AthleteDomainError) {
      throw new InvalidAthleteStateError(error.message);
    }

    throw error;
  }

  async findById(
    athleteId: AthleteId,
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    return athlete;
  }

  async findDetailsById(
    athleteId: AthleteId,
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    const athleteWithDetails =
      await this.athleteReadRepository.findDetailsByUserId(athlete.userId);

    if (!athleteWithDetails) {
      throw new AthleteNotFoundError('Athlete not found');
    }

    return athleteWithDetails;
  }

  async listAccessibleDetails(
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]> {
    const athleteUserIds = await this.getAuthorizedAthleteUserIds(
      currentUserId,
      organizationId
    );

    const athletes =
      await this.athleteReadRepository.listDetailsByUserIds(athleteUserIds);
    if (!athletes) {
      throw new AthleteNotFoundError('Athletes not found');
    }

    return athletes;
  }

  async listDetailsByOrganization(
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]> {
    const athleteUserIds =
      await this.organizationMembership.listAthleteUserIds(organizationId);
    const athletes =
      await this.athleteReadRepository.listDetailsByUserIds(athleteUserIds);

    if (!athletes) {
      throw new AthleteNotFoundError('Athletes not found');
    }

    return athletes;
  }

  async listAccessible(
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete[]> {
    const athleteUserIds = await this.getAuthorizedAthleteUserIds(
      currentUserId,
      organizationId
    );

    const athletes = await this.athleteRepository.listByUserIds(athleteUserIds);
    if (!athletes) {
      throw new AthleteNotFoundError('Athletes not found');
    }

    return athletes;
  }

  async create(data: AthleteCreation): Promise<Athlete> {
    const userProfile = await this.athleteUserProfile.exists(data.userId);

    if (!userProfile) {
      throw new UserNotFoundError('User not found');
    }

    const athleteProfile = await this.athleteRepository.findByUserId(
      data.userId
    );

    if (athleteProfile) {
      throw new AthleteAlreadyExistsError(
        'User already has an athlete profile'
      );
    }

    try {
      const athlete = new Athlete(data);

      return await this.athleteRepository.save(athlete);
    } catch (error) {
      this.toInvalidAthleteCreationError(error);
    }
  }

  async updateOwn(
    athleteId: AthleteId,
    data: AthleteUpdate,
    userId: string
  ): Promise<Athlete> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    try {
      const updatedAthlete = new Athlete({
        id: athlete.id,
        userId: athlete.userId,
        firstName: data.firstName ?? athlete.firstName,
        lastName: data.lastName ?? athlete.lastName,
        birthday:
          data.birthday !== undefined ? data.birthday : athlete.birthday,
        country: data.country !== undefined ? data.country : athlete.country,
      });

      return await this.athleteRepository.save(updatedAthlete);
    } catch (error) {
      this.toInvalidAthleteStateError(error);
    }
  }

  async findIdByUserId(userId: string): Promise<string | null> {
    const athlete = await this.athleteRepository.findByUserId(userId);
    return athlete?.id?.value ?? null;
  }

  async deleteOwn(athleteId: AthleteId, userId: string): Promise<void> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    await this.athleteRepository.remove(athlete);
  }
}
