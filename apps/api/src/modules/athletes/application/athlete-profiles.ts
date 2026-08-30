import type { OrganizationId, UserId } from '../../../shared/kernel/identity';
import type { SearchablePaginationQuery } from '../../../shared/kernel/pagination';
import {
  Athlete,
  type AthleteCreation,
  type AthleteUpdate,
} from '../domain/athlete';
import type { AthleteId } from '../domain/athlete-id';
import {
  AthleteNotFoundError,
  AthleteProfileAlreadyExistsError,
  UserDoesNotBelongToOrganizationError,
  UserProfileNotFoundError,
} from './errors/athlete.errors';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import type { IAthleteProfiles } from './ports/in/athlete-profiles.port';
import { IAthleteUserProfile } from './ports/out/athlete-user-profile.port';
import {
  IAthleteReadRepository,
  IAthleteRepository,
} from './ports/out/athlete.repository.port';
import { IOrganizationMembership } from './ports/out/organization-membership.port';
import type {
  AthleteDetailsReadModel,
  PaginatedAthleteDetailsReadModel,
} from './models/athlete-details.read-model';

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
      throw new AthleteNotFoundError(athleteId);
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
        currentUserId,
        organizationId
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
      throw new AthleteNotFoundError(athlete.id);
    }

    return athleteWithDetails;
  }

  async listAccessibleDetails(
    currentUserId: UserId,
    organizationId: OrganizationId,
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel> {
    const athleteUserIds = await this.getAuthorizedAthleteUserIds(
      currentUserId,
      organizationId
    );

    return await this.athleteReadRepository.listDetailsByUserIds(
      athleteUserIds,
      query
    );
  }

  async listDetailsByOrganization(
    organizationId: OrganizationId,
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel> {
    const athleteUserIds =
      await this.organizationMembership.listAthleteUserIds(organizationId);

    return await this.athleteReadRepository.listDetailsByUserIds(
      athleteUserIds,
      query
    );
  }

  async listAccessible(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<Athlete[]> {
    const athleteUserIds = await this.getAuthorizedAthleteUserIds(
      currentUserId,
      organizationId
    );

    return this.athleteRepository.listByUserIds(athleteUserIds);
  }

  async create(candidate: AthleteCreation): Promise<Athlete> {
    const existingUserProfileExists = await this.athleteUserProfile.exists(
      candidate.userId
    );

    if (!existingUserProfileExists) {
      throw new UserProfileNotFoundError(candidate.userId);
    }

    const existingAthleteProfile = await this.athleteRepository.findByUserId(
      candidate.userId
    );

    if (existingAthleteProfile) {
      throw new AthleteProfileAlreadyExistsError(candidate.userId);
    }

    const newAthlete = Athlete.create(candidate);

    return this.athleteRepository.add(newAthlete);
  }

  async updateOwn(
    athleteId: AthleteId,
    changes: AthleteUpdate,
    userId: UserId
  ): Promise<Athlete> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    const updatedAthlete = athlete.update(changes);

    return this.athleteRepository.save(updatedAthlete);
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
