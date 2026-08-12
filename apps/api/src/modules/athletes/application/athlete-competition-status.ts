import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import { CompetitorStatus } from '../domain/competitor-status';
import type { Athlete } from '../domain/athlete';
import { IAthleteCompetitionStatus } from './ports/athlete-competition-status.port';
import { ICompetitorStatusRepository } from './ports/competitor-status.repository.port';
import { IAthleteRepository } from './ports/athlete.repository.port';
import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import {
  NoAthletesFoundException,
  CompetitorStatusNotFoundException,
  AthleteNotFoundException,
  CompetitorStatusAccessDeniedException,
} from './errors/competitor-status.exceptions';

/**
 * Athlete Competition Status
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class AthleteCompetitionStatus implements IAthleteCompetitionStatus {
  constructor(
    private readonly competitorStatusRepository: ICompetitorStatusRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly memberUseCases: IMemberUseCases
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

  private async assertCanViewCompetitionStatus(
    currentUserId: string,
    organizationId: string,
    athleteUserId: string,
  ): Promise<void> {
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(
      currentUserId,
      organizationId
    );

    if (!isUserCoach && currentUserId !== athleteUserId) {
      throw new CompetitorStatusAccessDeniedException(
        'Access denied. You can only access your own competitor status or the competitor status of an athlete you are coaching'
      );
    }
  }

  private async assertCanManageCompetitionStatus(
    currentUserId: string,
    organizationId: string
  ): Promise<void> {
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(
      currentUserId,
      organizationId
    );

    if (!isUserCoach) {
      throw new CompetitorStatusAccessDeniedException(
        'Access denied. Only coaches can manage competitor status'
      );
    }
  }

  private async assertAthleteBelongsToOrganization(
    athleteUserId: string,
    organizationId: string
  ): Promise<void> {
    const isAthleteInOrganization =
      await this.memberUseCases.isUserAthleteInOrganization(
        athleteUserId,
        organizationId
      );

    if (!isAthleteInOrganization) {
      throw new CompetitorStatusAccessDeniedException(
        'Access denied. Athlete does not belong to organization'
      );
    }
  }

  private async closeCurrentStatusIfExists(athleteId: string): Promise<void> {
    const currentCompetitorStatus =
      await this.competitorStatusRepository.findByAthleteId(athleteId);

    if (!currentCompetitorStatus) {
      return;
    }

    const closedCompetitorStatus = new CompetitorStatus({
      id: currentCompetitorStatus.id,
      athleteId: currentCompetitorStatus.athleteId,
      level: currentCompetitorStatus.level,
      sexCategory: currentCompetitorStatus.sexCategory,
      weightCategory: currentCompetitorStatus.weightCategory,
      endDate: new Date(),
    });

    await this.competitorStatusRepository.save(closedCompetitorStatus);
  }

  async findAll(organizationId: string): Promise<CompetitorStatus[]> {
    const athleteUserIds =
      await this.memberUseCases.getAthleteUserIds(organizationId);

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

  async findOne(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.assertCanViewCompetitionStatus(
      currentUserId,
      organizationId,
      athlete.userId
    );

    const competitorStatus =
      await this.competitorStatusRepository.findByAthleteId(athleteId);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundException(
        `Active competitor status for athlete with ID ${athleteId} not found`
      );
    }

    return competitorStatus;
  }

  async create(
    data: CreateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    await this.assertCanManageCompetitionStatus(currentUserId, organizationId);

    const athlete = await this.getAthleteOrThrow(data.athleteId);

    await this.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.closeCurrentStatusIfExists(data.athleteId);

    const competitorStatusToCreate = new CompetitorStatus({
      athleteId: data.athleteId,
      level: data.level,
      sexCategory: data.sexCategory,
      weightCategory: data.weightCategory,
    });

    return await this.competitorStatusRepository.save(competitorStatusToCreate);
  }

  async update(
    id: string,
    data: UpdateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    await this.assertCanManageCompetitionStatus(currentUserId, organizationId);

    const competitorStatusToUpdate = await this.getCompetitorStatusOrThrow(id);
    const athlete = await this.getAthleteOrThrow(
      competitorStatusToUpdate.athleteId
    );

    await this.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

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

    return await this.competitorStatusRepository.save(updatedCompetitorStatus);
  }
}
