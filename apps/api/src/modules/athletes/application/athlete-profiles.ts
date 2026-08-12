import {
  Athlete,
  AthleteDomainError,
  type AthleteCreation,
  type AthleteUpdate,
} from '../domain/athlete';
import type { IAthleteProfiles } from './ports/athlete-profiles.port';
import type { AthleteDetailsReadModel } from './read-models/athlete-details.read-model';
import {
  IAthleteRepository,
  IAthleteReadRepository,
} from './ports/athlete.repository.port';
import { IUserUseCases } from '../../auth/application/ports/user-use-cases.port';
import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import {
  AthleteNotFoundError,
  UserNotFoundError,
  AthleteAlreadyExistsError,
  InvalidAthleteCreationError,
  InvalidAthleteStateError,
  UserDoesNotBelongToOrganizationError,
} from './errors/athlete.errors';
import { AthleteAccessPolicy } from './athlete-access.policy';

/**
 * Athlete Profiles
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class AthleteProfiles implements IAthleteProfiles {
  constructor(
    private readonly athleteRepository: IAthleteRepository,
    private readonly athleteReadRepository: IAthleteReadRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly memberUseCases: IMemberUseCases,
    private readonly athleteAccessPolicy: AthleteAccessPolicy
  ) {}

  private async getAthleteOrThrow(athleteId: string): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundError(`Athlete with ID ${athleteId} not found`);
    }

    return athlete;
  }

  private async getAuthorizedAthleteUserIds(
    currentUserId: string,
    organizationId: string
  ): Promise<string[]> {
    const [isUserCoach, athleteUserIds] = await Promise.all([
      this.memberUseCases.isUserCoachInOrganization(
        currentUserId,
        organizationId
      ),
      this.memberUseCases.getAthleteUserIds(organizationId),
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

  async findOne(
    athleteId: string,
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

  async findOneWithDetails(
    athleteId: string,
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

  async findAllWithDetails(
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

  async findAllWithDetailsByOrganization(
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]> {
    const athleteUserIds =
      await this.memberUseCases.getAthleteUserIds(organizationId);
    const athletes =
      await this.athleteReadRepository.listDetailsByUserIds(athleteUserIds);

    if (!athletes) {
      throw new AthleteNotFoundError('Athletes not found');
    }

    return athletes;
  }

  async findAll(
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
    const user = await this.userUseCases.getOne(data.userId);

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    const existingAthlete = await this.athleteRepository.findByUserId(
      data.userId
    );

    if (existingAthlete) {
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

  async update(
    idAthlete: string,
    data: AthleteUpdate,
    userId: string
  ): Promise<Athlete> {
    const athlete = await this.getAthleteOrThrow(idAthlete);

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

  async getAthleteId(userId: string): Promise<string | null> {
    const athlete = await this.athleteRepository.findByUserId(userId);
    return athlete?.id ?? null;
  }

  async delete(idAthlete: string, userId: string): Promise<void> {
    const athlete = await this.getAthleteOrThrow(idAthlete);

    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId: userId,
      athleteUserId: athlete.userId,
    });

    await this.athleteRepository.remove(athlete);
  }
}
