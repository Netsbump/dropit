import {
  CreateCompetitorStatus,
  UpdateCompetitorStatus,
} from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompetitorStatus } from '../../domain/competitor-status.entity';
import { COMPETITOR_STATUS_REPO, ICompetitorStatusRepository } from '../../application/ports/competitor-status.repository';
import { CompetitorStatusMapper } from '../../interface/mappers/competitor-status.mapper';
import { CompetitorStatusPresenter } from '../../interface/presenter/competitor-status.presenter';
import { IAthleteRepository } from '../ports/athlete.repository';
import { ATHLETE_REPO } from '../ports/athlete.repository';
import { MemberUseCases } from '../../../identity/application/member.use-cases';

@Injectable()
export class CompetitorStatusUseCases {
  constructor(
    @Inject(COMPETITOR_STATUS_REPO)
    private readonly competitorStatusRepository: ICompetitorStatusRepository,
    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getAll(organizationId: string) {
    try {
      // 1. Get ids of athletes in the organization
      const athleteUserIds = await this.memberUseCases.getAthleteUserIds(organizationId);

      if (athleteUserIds.length === 0) {
        throw new NotFoundException('No athletes found in the organization');
      }

      // 2. Get competitor statuses
      const competitorStatuses = await this.competitorStatusRepository.getAll(athleteUserIds);

      if (!competitorStatuses || competitorStatuses.length === 0) {
        throw new NotFoundException('No competitor statuses found');
      }

      // 3. Map to DTO
      const competitorStatusesDto = CompetitorStatusMapper.toDtoList(competitorStatuses);

      // 4. Present competitor statuses
      return CompetitorStatusPresenter.present(competitorStatusesDto);
    } catch (error) {
      return CompetitorStatusPresenter.presentError(error as Error);
    }
  }

  async getOne(athleteId: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get athlete to verify it exists and get its userId
      const athlete = await this.athleteRepository.getOne(athleteId);
      if (!athlete || !athlete.user) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }

      // 2. Validate user access
      const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own competitor status or the competitor status of an athlete you are coaching"
        );
      }

      // 3. Get competitor status using repository
      const competitorStatus = await this.competitorStatusRepository.getOne(athleteId);

      if (!competitorStatus) {
        throw new NotFoundException(
          `Active competitor status for athlete with ID ${athleteId} not found`
        );
      }

      // 4. Map to DTO
      const competitorStatusDto = CompetitorStatusMapper.toDto(competitorStatus);

      // 5. Present competitor status
      return CompetitorStatusPresenter.presentOne(competitorStatusDto);
    } catch (error) {
      return CompetitorStatusPresenter.presentError(error as Error);
    }
  }

  async create(
    newStatus: CreateCompetitorStatus,
    currentUserId: string,
    organizationId: string
  ) {
    try {
      // 1. Validate user access - only admin/owner can create competitor status
      const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
      if (!isUserCoach) {
        throw new NotFoundException(
          "Access denied. Only coaches can create competitor status"
        );
      }

      // 2. Verify athlete belongs to organization
      await this.memberUseCases.isUserAthleteInOrganization(newStatus.athleteId, organizationId);

      // 3. Get athlete to verify it exists and get the entity
      const athlete = await this.athleteRepository.getOne(newStatus.athleteId);
      if (!athlete) {
        throw new NotFoundException(
          `Athlete with ID ${newStatus.athleteId} not found`
        );
      }

      // 4. Close previous active competitor status if exists
      const lastCompetitorStatus = await this.competitorStatusRepository.getOne(newStatus.athleteId);
      if (lastCompetitorStatus) {
        lastCompetitorStatus.endDate = new Date();
        await this.competitorStatusRepository.save(lastCompetitorStatus);
      }

      // 5. Create new competitor status
      const competitorStatusToCreate = new CompetitorStatus();
      competitorStatusToCreate.athlete = athlete;
      competitorStatusToCreate.level = newStatus.level;
      competitorStatusToCreate.sexCategory = newStatus.sexCategory;
      competitorStatusToCreate.weightCategory = newStatus.weightCategory;

      await this.competitorStatusRepository.save(competitorStatusToCreate);

      // 6. Get created competitor status
      const competitorStatusCreated = await this.competitorStatusRepository.getOne(newStatus.athleteId);

      if (!competitorStatusCreated) {
        throw new NotFoundException('Competitor status not found');
      }

      // 7. Map to DTO
      const competitorStatusDto = CompetitorStatusMapper.toDto(competitorStatusCreated);

      // 8. Present competitor status
      return CompetitorStatusPresenter.presentOne(competitorStatusDto);
    } catch (error) {
      return CompetitorStatusPresenter.presentError(error as Error);
    }
  }

  async update(
    id: string,
    status: UpdateCompetitorStatus,
    currentUserId: string,
    organizationId: string
  ) {
    try {
      // 1. Validate user access - only coaches can update competitor status
      const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
      if (!isUserCoach) {
        throw new NotFoundException(
          "Access denied. Only coaches can update competitor status"
        );
      }

      // 2. Get competitor status to update
      const competitorStatusToUpdate = await this.competitorStatusRepository.getOne(id);

      if (!competitorStatusToUpdate) {
        throw new NotFoundException(`Competitor status with ID ${id} not found`);
      }

      // 3. Verify athlete still belongs to organization
      await this.memberUseCases.isUserAthleteInOrganization(competitorStatusToUpdate.athlete.id, organizationId);

      // 4. Update competitor status fields
      if (status.level) {
        competitorStatusToUpdate.level = status.level;
      }
      if (status.sexCategory) {
        competitorStatusToUpdate.sexCategory = status.sexCategory;
      }
      if (status.weightCategory !== undefined) {
        competitorStatusToUpdate.weightCategory = status.weightCategory;
      }

      // 5. Save updated competitor status
      await this.competitorStatusRepository.save(competitorStatusToUpdate);

      // 6. Get updated competitor status
      const competitorStatusUpdated = await this.competitorStatusRepository.getOne(id);

      if (!competitorStatusUpdated) {
        throw new NotFoundException('Competitor status not found');
      }

      // 7. Map to DTO
      const competitorStatusDto = CompetitorStatusMapper.toDto(competitorStatusUpdated);

      // 8. Present competitor status
      return CompetitorStatusPresenter.presentOne(competitorStatusDto);
    } catch (error) {
      return CompetitorStatusPresenter.presentError(error as Error);
    }
  }
}
