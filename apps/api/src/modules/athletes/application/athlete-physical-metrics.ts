import {
  CreatePhysicalMetricInput,
  UpdatePhysicalMetricInput,
} from '@dropit/schemas';
import type { OrganizationId, UserId } from '../../../shared/kernel/identity';
import type { Athlete } from '../domain/athlete';
import type { AthleteId } from '../domain/athlete-id';
import {
  PhysicalMetric,
  PhysicalMetricDomainError,
} from '../domain/physical-metric';
import type { PhysicalMetricId } from '../domain/physical-metric-id';
import {
  InvalidPhysicalMetricException,
  PhysicalMetricAthleteNotFoundException,
  PhysicalMetricNotFoundException,
} from './errors/physical-metric.exceptions';
import type { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import type { IAthletePhysicalMetrics } from './ports/in/athlete-physical-metrics.port';
import type { IAthleteRepository } from './ports/out/athlete.repository.port';
import type { IPhysicalMetricRepository } from './ports/out/physical-metric.repository.port';

export class AthletePhysicalMetrics implements IAthletePhysicalMetrics {
  constructor(
    private readonly physicalMetricRepository: IPhysicalMetricRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly athleteAccessPolicy: IAthleteAccessPolicy
  ) {}

  private async getAthleteOrThrow(athleteId: AthleteId): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new PhysicalMetricAthleteNotFoundException(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getPhysicalMetricOrThrow(
    id: PhysicalMetricId
  ): Promise<PhysicalMetric> {
    const physicalMetric = await this.physicalMetricRepository.findById(id);

    if (!physicalMetric) {
      throw new PhysicalMetricNotFoundException(
        `Physical metric with ID ${id} not found`
      );
    }

    return physicalMetric;
  }

  private async assertCanManageOwnMetric(
    athlete: Athlete,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void> {
    this.athleteAccessPolicy.assertCanManageOwnAthlete({
      currentUserId,
      athleteUserId: athlete.userId,
    });

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );
  }

  async findById(
    id: PhysicalMetricId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric> {
    const physicalMetric = await this.getPhysicalMetricOrThrow(id);
    const athlete = await this.getAthleteOrThrow(physicalMetric.athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    return physicalMetric;
  }

  async findMetricHistoryByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric[]> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    return await this.physicalMetricRepository.listByAthleteId(athleteId);
  }

  async recordBodyMetric(
    athleteId: AthleteId,
    data: CreatePhysicalMetricInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.assertCanManageOwnMetric(athlete, currentUserId, organizationId);

    let physicalMetric: PhysicalMetric;

    try {
      physicalMetric = new PhysicalMetric({
        athleteId,
        weight: data.weight,
        height: data.height,
        date: data.date,
      });
    } catch (error) {
      if (error instanceof PhysicalMetricDomainError) {
        throw new InvalidPhysicalMetricException(error.message);
      }

      throw error;
    }

    return await this.physicalMetricRepository.save(physicalMetric);
  }

  async amend(
    id: PhysicalMetricId,
    data: UpdatePhysicalMetricInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric> {
    const physicalMetric = await this.getPhysicalMetricOrThrow(id);
    const athlete = await this.getAthleteOrThrow(physicalMetric.athleteId);

    await this.assertCanManageOwnMetric(athlete, currentUserId, organizationId);

    let physicalMetricToUpdate: PhysicalMetric;

    try {
      physicalMetricToUpdate = physicalMetric.amend(data);
    } catch (error) {
      if (error instanceof PhysicalMetricDomainError) {
        throw new InvalidPhysicalMetricException(error.message);
      }

      throw error;
    }

    return await this.physicalMetricRepository.save(physicalMetricToUpdate);
  }

  async remove(
    id: PhysicalMetricId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void> {
    const physicalMetric = await this.getPhysicalMetricOrThrow(id);
    const athlete = await this.getAthleteOrThrow(physicalMetric.athleteId);

    await this.assertCanManageOwnMetric(athlete, currentUserId, organizationId);

    await this.physicalMetricRepository.remove(physicalMetric);
  }
}
