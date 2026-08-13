import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import {
  CompetitorStatus,
  CompetitorStatusDomainError,
} from '../domain/competitor-status';
import type { Athlete } from '../domain/athlete';
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

  private async getAthleteOrThrow(athleteId: string): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getCompetitorStatusOrThrow(
    id: string
  ): Promise<CompetitorStatus> {
    const competitorStatus = await this.competitorStatusRepository.findById(id);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundException(
        `Competitor status with ID ${id} not found`
      );
    }

    return competitorStatus;
  }

  private toInvalidCompetitorStatusError(error: unknown): never {
    if (error instanceof CompetitorStatusDomainError) {
      throw new InvalidCompetitorStatusException(error.message);
    }

    throw error;
  }

  private async closeCurrentStatusIfExists(athleteId: string): Promise<void> {
    const currentCompetitorStatus =
      await this.competitorStatusRepository.findActiveByAthleteId(athleteId);

    if (!currentCompetitorStatus) {
      return;
    }

    try {
      const closedCompetitorStatus = new CompetitorStatus({
        id: currentCompetitorStatus.id,
        athleteId: currentCompetitorStatus.athleteId,
        level: currentCompetitorStatus.level,
        sexCategory: currentCompetitorStatus.sexCategory,
        weightCategory: currentCompetitorStatus.weightCategory,
        endDate: new Date(),
      });

      await this.competitorStatusRepository.save(closedCompetitorStatus);
    } catch (error) {
      this.toInvalidCompetitorStatusError(error);
    }
  }

  async listByOrganization(
    organizationId: string
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
    athleteId: string,
    currentUserId: string,
    organizationId: string
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
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const athlete = await this.getAthleteOrThrow(data.athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.closeCurrentStatusIfExists(data.athleteId);

    try {
      const competitorStatusToCreate = new CompetitorStatus({
        athleteId: data.athleteId,
        level: data.level,
        sexCategory: data.sexCategory,
        weightCategory: data.weightCategory,
      });

      return await this.competitorStatusRepository.save(
        competitorStatusToCreate
      );
    } catch (error) {
      this.toInvalidCompetitorStatusError(error);
    }
  }

  async amend(
    id: string,
    data: UpdateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
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

    try {
      const updatedCompetitorStatus = new CompetitorStatus({
        id: competitorStatusToUpdate.id,
        athleteId: competitorStatusToUpdate.athleteId,
        level: data.level ?? competitorStatusToUpdate.level,
        sexCategory: data.sexCategory ?? competitorStatusToUpdate.sexCategory,
        weightCategory:
          data.weightCategory !== undefined
            ? data.weightCategory
            : competitorStatusToUpdate.weightCategory,
        endDate: competitorStatusToUpdate.endDate,
      });

      return await this.competitorStatusRepository.save(
        updatedCompetitorStatus
      );
    } catch (error) {
      this.toInvalidCompetitorStatusError(error);
    }
  }
}
