import { UpdateCompetitorStatusInput } from '@dropit/schemas';
import type { OrganizationId, UserId } from '../../../shared/kernel/identity';
import type { Athlete } from '../domain/athlete';
import type { AthleteId } from '../domain/athlete-id';
import {
  CompetitorStatus,
  type CompetitorStatusCreation,
} from '../domain/competitor-status';
import type { CompetitorStatusId } from '../domain/competitor-status-id';
import { AthleteNotFoundError } from './errors/athlete.errors';
import {
  ActiveCompetitorStatusNotFoundError,
  CompetitorStatusNotFoundError,
} from './errors/competitor-status.errors';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import { IAthleteCompetitionStatus } from './ports/in/athlete-competition-status.port';
import { IAthleteRepository } from './ports/out/athlete.repository.port';
import { ICompetitorStatusRepository } from './ports/out/competitor-status.repository.port';
import { IOrganizationMembership } from './ports/out/organization-membership.port';

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
      throw new AthleteNotFoundError(athleteId);
    }

    return athlete;
  }

  private async getCompetitorStatusOrThrow(
    id: CompetitorStatusId
  ): Promise<CompetitorStatus> {
    const competitorStatus = await this.competitorStatusRepository.findById(id);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundError(id);
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

    const closedCompetitorStatus = currentCompetitorStatus.close();

    await this.competitorStatusRepository.save(closedCompetitorStatus);
  }

  async listByOrganization(
    organizationId: OrganizationId
  ): Promise<CompetitorStatus[]> {
    const athleteUserIds =
      await this.organizationMembership.listAthleteUserIds(organizationId);

    return this.competitorStatusRepository.listByAthleteUserIds(athleteUserIds);
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
      throw new ActiveCompetitorStatusNotFoundError(athleteId);
    }

    return competitorStatus;
  }

  async change(
    creation: CompetitorStatusCreation,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const athlete = await this.getAthleteOrThrow(creation.athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.closeCurrentStatusIfExists(creation.athleteId);

    const competitorStatusToCreate = CompetitorStatus.create(creation);

    return await this.competitorStatusRepository.add(competitorStatusToCreate);
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

    const updatedCompetitorStatus = competitorStatusToUpdate.amend(data);

    return await this.competitorStatusRepository.save(updatedCompetitorStatus);
  }
}
