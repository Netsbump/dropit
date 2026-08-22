import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import {
  CompetitorStatus,
  CompetitorStatusDomainError,
} from '../domain/competitor-status';
import type { Athlete } from '../domain/athlete';
import { parseAthleteId, type AthleteId } from '../domain/athlete-id';
import type { CompetitorStatusId } from '../domain/competitor-status-id';
import type { OrganizationId, UserId } from '../../../shared/kernel/identity';
import { IAthleteCompetitionStatus } from './ports/in/athlete-competition-status.port';
import { ICompetitorStatusRepository } from './ports/out/competitor-status.repository.port';
import { IAthleteRepository } from './ports/out/athlete.repository.port';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import { IOrganizationMembership } from './ports/out/organization-membership.port';
import {
  NoAthletesFoundException,
  CompetitorStatusNotFoundException,
  AthleteNotFoundException,
  InvalidCompetitorStatusException,
} from './errors/competitor-status.exceptions';

export class AthleteCompetitionStatus implements IAthleteCompetitionStatus {
  constructor(
    private readonly competitorStatusRepository: ICompetitorStatusRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly organizationMembership: IOrganizationMembership,
    private readonly athleteAccessPolicy: IAthleteAccessPolicy
  ) {}

  private async getAthleteOrThrow(athleteId: AthleteId): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getCompetitorStatusOrThrow(
    id: CompetitorStatusId
  ): Promise<CompetitorStatus> {
    const competitorStatus = await this.competitorStatusRepository.findById(id);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundException(
        `Competitor status with ID ${id} not found`
      );
    }

    return competitorStatus;
  }

  private async closeCurrentStatusIfExists(
    athleteId: AthleteId
  ): Promise<void> {
    const currentCompetitorStatus =
      await this.competitorStatusRepository.findActiveByAthleteId(athleteId);

    if (!currentCompetitorStatus) {
      return;
    }

    let closedCompetitorStatus: CompetitorStatus;

    try {
      closedCompetitorStatus = currentCompetitorStatus.close();
    } catch (error) {
      if (error instanceof CompetitorStatusDomainError) {
        throw new InvalidCompetitorStatusException(error.message);
      }

      throw error;
    }

    await this.competitorStatusRepository.save(closedCompetitorStatus);
  }

  async listByOrganization(
    organizationId: OrganizationId
  ): Promise<CompetitorStatus[]> {
    const athleteUserIds =
      await this.organizationMembership.listAthleteUserIds(organizationId);

    if (athleteUserIds.length === 0) {
      throw new NoAthletesFoundException(
        'No athletes found in the organization'
      );
    }

    const competitorStatuses =
      await this.competitorStatusRepository.listByAthleteUserIds(
        athleteUserIds
      );

    if (!competitorStatuses || competitorStatuses.length === 0) {
      throw new CompetitorStatusNotFoundException(
        'No competitor statuses found'
      );
    }

    return competitorStatuses;
  }

  async findActiveByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    const competitorStatus =
      await this.competitorStatusRepository.findActiveByAthleteId(athleteId);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundException(
        `Active competitor status for athlete with ID ${athleteId} not found`
      );
    }

    return competitorStatus;
  }

  async change(
    data: CreateCompetitorStatusInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const athleteId = parseAthleteId(data.athleteId);
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.closeCurrentStatusIfExists(athleteId);

    let competitorStatusToCreate: CompetitorStatus;

    try {
      competitorStatusToCreate = new CompetitorStatus({
        athleteId,
        level: data.level,
        sexCategory: data.sexCategory,
        weightCategory: data.weightCategory,
      });
    } catch (error) {
      if (error instanceof CompetitorStatusDomainError) {
        throw new InvalidCompetitorStatusException(error.message);
      }

      throw error;
    }

    return await this.competitorStatusRepository.save(competitorStatusToCreate);
  }

  async amend(
    id: CompetitorStatusId,
    data: UpdateCompetitorStatusInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const competitorStatusToUpdate = await this.getCompetitorStatusOrThrow(id);

    const athlete = await this.getAthleteOrThrow(
      competitorStatusToUpdate.athleteId
    );

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    let updatedCompetitorStatus: CompetitorStatus;

    try {
      updatedCompetitorStatus = competitorStatusToUpdate.amend(data);
    } catch (error) {
      if (error instanceof CompetitorStatusDomainError) {
        throw new InvalidCompetitorStatusException(error.message);
      }

      throw error;
    }

    return await this.competitorStatusRepository.save(updatedCompetitorStatus);
  }
}
