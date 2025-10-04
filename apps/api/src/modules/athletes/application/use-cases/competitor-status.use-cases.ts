import {
  CreateCompetitorStatus,
  UpdateCompetitorStatus,
} from '@dropit/schemas';
import { CompetitorStatus } from '../../domain/competitor-status.entity';
import { ICompetitorStatusUseCases } from '../ports/competitor-status-use-cases.port';
import { ICompetitorStatusRepository } from '../ports/competitor-status.repository.port';
import { IAthleteRepository } from '../ports/athlete.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import {
  NoAthletesFoundException,
  CompetitorStatusNotFoundException,
  AthleteNotFoundException,
  CompetitorStatusAccessDeniedException,
} from '../exceptions/competitor-status.exceptions';

/**
 * Competitor Status Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of competitor status business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class CompetitorStatusUseCases implements ICompetitorStatusUseCases {
  constructor(
    private readonly competitorStatusRepository: ICompetitorStatusRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async findAll(organizationId: string): Promise<CompetitorStatus[]> {
    // 1. Get ids of athletes in the organization
    const athleteUserIds = await this.memberUseCases.getAthleteUserIds(organizationId);

    if (athleteUserIds.length === 0) {
      throw new NoAthletesFoundException('No athletes found in the organization');
    }

    // 2. Get competitor statuses
    const competitorStatuses = await this.competitorStatusRepository.getAll(athleteUserIds);

    if (!competitorStatuses || competitorStatuses.length === 0) {
      throw new CompetitorStatusNotFoundException('No competitor statuses found');
    }

    return competitorStatuses;
  }

  async findOne(athleteId: string, currentUserId: string, organizationId: string): Promise<CompetitorStatus> {
    // 1. Get athlete to verify it exists and get its userId
    const athlete = await this.athleteRepository.getOne(athleteId);
    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // 2. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new CompetitorStatusAccessDeniedException(
        "Access denied. You can only access your own competitor status or the competitor status of an athlete you are coaching"
      );
    }

    // 3. Get competitor status using repository
    const competitorStatus = await this.competitorStatusRepository.getOne(athleteId);

    if (!competitorStatus) {
      throw new CompetitorStatusNotFoundException(
        `Active competitor status for athlete with ID ${athleteId} not found`
      );
    }

    return competitorStatus;
  }

  async create(
    data: CreateCompetitorStatus,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    // 1. Validate user access - only admin/owner can create competitor status
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach) {
      throw new CompetitorStatusAccessDeniedException(
        "Access denied. Only coaches can create competitor status"
      );
    }

    // 2. Verify athlete belongs to organization
    await this.memberUseCases.isUserAthleteInOrganization(data.athleteId, organizationId);

    // 3. Get athlete to verify it exists and get the entity
    const athlete = await this.athleteRepository.getOne(data.athleteId);
    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${data.athleteId} not found`
      );
    }

    // 4. Close previous active competitor status if exists
    const lastCompetitorStatus = await this.competitorStatusRepository.getOne(data.athleteId);
    if (lastCompetitorStatus) {
      lastCompetitorStatus.endDate = new Date();
      await this.competitorStatusRepository.save(lastCompetitorStatus);
    }

    // 5. Create new competitor status
    const competitorStatusToCreate = new CompetitorStatus();
    competitorStatusToCreate.athlete = athlete;
    competitorStatusToCreate.level = data.level;
    competitorStatusToCreate.sexCategory = data.sexCategory;
    competitorStatusToCreate.weightCategory = data.weightCategory;

    await this.competitorStatusRepository.save(competitorStatusToCreate);

    // 6. Get created competitor status
    const competitorStatusCreated = await this.competitorStatusRepository.getOne(data.athleteId);

    if (!competitorStatusCreated) {
      throw new CompetitorStatusNotFoundException('Competitor status not found');
    }

    return competitorStatusCreated;
  }

  async update(
    id: string,
    data: UpdateCompetitorStatus,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus> {
    // 1. Validate user access - only coaches can update competitor status
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach) {
      throw new CompetitorStatusAccessDeniedException(
        "Access denied. Only coaches can update competitor status"
      );
    }

    // 2. Get competitor status to update
    const competitorStatusToUpdate = await this.competitorStatusRepository.getOne(id);

    if (!competitorStatusToUpdate) {
      throw new CompetitorStatusNotFoundException(`Competitor status with ID ${id} not found`);
    }

    // 3. Verify athlete still belongs to organization
    await this.memberUseCases.isUserAthleteInOrganization(competitorStatusToUpdate.athlete.id, organizationId);

    // 4. Update competitor status fields
    if (data.level) {
      competitorStatusToUpdate.level = data.level;
    }
    if (data.sexCategory) {
      competitorStatusToUpdate.sexCategory = data.sexCategory;
    }
    if (data.weightCategory !== undefined) {
      competitorStatusToUpdate.weightCategory = data.weightCategory;
    }

    // 5. Save updated competitor status
    await this.competitorStatusRepository.save(competitorStatusToUpdate);

    // 6. Get updated competitor status
    const competitorStatusUpdated = await this.competitorStatusRepository.getOne(id);

    if (!competitorStatusUpdated) {
      throw new CompetitorStatusNotFoundException('Competitor status not found');
    }

    return competitorStatusUpdated;
  }
}
