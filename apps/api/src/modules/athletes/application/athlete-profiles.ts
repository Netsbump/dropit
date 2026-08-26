import type { OrganizationId, UserId } from '../../../shared/kernel/identity';
import {
  Athlete,
  type AthleteCreation,
  AthleteDomainError,
  type AthleteUpdate,
} from '../domain/athlete';
import type { AthleteId } from '../domain/athlete-id';
import {
  AthleteAlreadyExistsError,
  AthleteNotFoundError,
  InvalidAthleteCreationError,
  InvalidAthleteUpdateError,
  UserDoesNotBelongToOrganizationError,
  UserNotFoundError,
} from './errors/athlete.errors';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import type { IAthleteProfiles } from './ports/in/athlete-profiles.port';
import { IAthleteUserProfile } from './ports/out/athlete-user-profile.port';
import {
  IAthleteReadRepository,
  IAthleteRepository,
} from './ports/out/athlete.repository.port';
import { IOrganizationMembership } from './ports/out/organization-membership.port';
import type { AthleteDetailsReadModel } from './read-models/athlete-details.read-model';

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
      throw new AthleteNotFoundError(`Athlete with ID ${athleteId} not found`);
    }

    return athlete;
  }

  private async getAuthorizedAthleteUserIds(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<UserId[]> {
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

  async findById(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
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
    currentUserId: UserId,
    organizationId: OrganizationId
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
    currentUserId: UserId,
    organizationId: OrganizationId
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
    organizationId: OrganizationId
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
    currentUserId: UserId,
    organizationId: OrganizationId
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

    let athlete: Athlete;

    try {
      athlete = new Athlete(data);
    } catch (error) {
      if (error instanceof AthleteDomainError) {
        throw new InvalidAthleteCreationError(error.message);
      }

      throw error;
    }

    return await this.athleteRepository.add(athlete);
  }

  async updateOwn(
    athleteId: AthleteId,
    data: AthleteUpdate,
    userId: UserId
  ): Promise<Athlete> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    let updatedAthlete: Athlete;

    try {
      updatedAthlete = athlete.updateProfile(data);
    } catch (error) {
      if (error instanceof AthleteDomainError) {
        throw new InvalidAthleteUpdateError(error.message);
      }

      throw error;
    }

    return await this.athleteRepository.save(updatedAthlete);
  }

  async findIdByUserId(userId: UserId): Promise<string | null> {
    const athlete = await this.athleteRepository.findByUserId(userId);
    return athlete?.id ?? null;
  }

  async deleteOwn(athleteId: AthleteId, userId: UserId): Promise<void> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    await this.athleteRepository.remove(athlete);
  }
}
