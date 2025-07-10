import {
  CompetitorStatusDto,
  CreateCompetitorStatus,
  UpdateCompetitorStatus,
} from '@dropit/schemas';
import { CompetitorLevel, SexCategory } from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../domain/athlete.entity';
import { CompetitorStatus } from '../../domain/competitor-status.entity';
import { OrganizationService } from '../../../../identity/organization/organization.service';
import { COMPETITOR_STATUS_REPO, CompetitorStatusRepository } from '../../application/ports/competitor-status.repository';
import { CompetitorStatusMapper } from '../../interface/mappers/competitor-status.mapper';
import { CompetitorStatusPresenter } from '../../interface/presenter/competitor-status.presenter';

@Injectable()
export class CompetitorStatusUseCases {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
    @Inject(COMPETITOR_STATUS_REPO)
    private readonly competitorStatusRepository: CompetitorStatusRepository,
  ) {}

  async getAll(organizationId: string) {
    try {
      // 1. Get ids of athletes in the organization
      const athleteUserIds = await this.organizationService.getAthleteUserIds(organizationId);

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

      // 1. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athleteId) {
        throw new NotFoundException(
          `Access denied. You can only access your own competitor status`
        );
      }

      // 2. Get competitor status using repository
      const competitorStatus = await this.competitorStatusRepository.getOne(athleteId);

      if (!competitorStatus) {
        throw new NotFoundException(
          `Active competitor status for athlete with ID ${athleteId} not found`
        );
      }

      // 3. Map to DTO
      const competitorStatusDto = CompetitorStatusMapper.toDto(competitorStatus);

      // 4. Present competitor status
      return CompetitorStatusPresenter.presentOne(competitorStatusDto);
    } catch (error) {
      return CompetitorStatusPresenter.presentError(error as Error);
    }
  }

  async createCompetitorStatus(
    newStatus: CreateCompetitorStatus
  ): Promise<CompetitorStatusDto> {
    const athlete = await this.em.findOne(Athlete, {
      id: newStatus.athleteId,
    });

    if (!athlete) {
      throw new NotFoundException(
        `Athlete with ID ${newStatus.athleteId} not found`
      );
    }

    const lastCompetitorStatus = await this.em.findOne(CompetitorStatus, {
      athlete: newStatus.athleteId,
      endDate: null,
    });

    if (lastCompetitorStatus) {
      lastCompetitorStatus.endDate = new Date();
      await this.em.persistAndFlush(lastCompetitorStatus);
    }

    const competitorStatusToCreate = new CompetitorStatus();

    competitorStatusToCreate.level = newStatus.level;
    competitorStatusToCreate.sexCategory = newStatus.sexCategory;
    competitorStatusToCreate.weightCategory = newStatus.weightCategory;

    await this.em.persistAndFlush(competitorStatusToCreate);

    const competitorStatusCreated = await this.em.findOne(CompetitorStatus, {
      id: competitorStatusToCreate.id,
    });

    if (!competitorStatusCreated) {
      throw new NotFoundException('Competitor status not found');
    }

    return {
      id: competitorStatusCreated.id,
      level: competitorStatusCreated.level as string,
      sexCategory: competitorStatusCreated.sexCategory as string,
      weightCategory: competitorStatusCreated.weightCategory ?? 0,
      updatedAt: competitorStatusCreated.updatedAt.toISOString(),
      endDate: competitorStatusCreated.endDate
        ? competitorStatusCreated.endDate.toISOString()
        : null,
    };
  }

  async updateCompetitorStatus(
    id: string,
    status: UpdateCompetitorStatus
  ): Promise<CompetitorStatusDto> {
    const competitorStatusToUpdate = await this.em.findOne(CompetitorStatus, {
      id,
    });

    if (!competitorStatusToUpdate) {
      throw new NotFoundException(`Competitor status with ID ${id} not found`);
    }

    const updateData: Partial<{
      level: CompetitorLevel;
      sexCategory: SexCategory;
      weightCategory?: number;
    }> = {};

    if (status.level) {
      updateData.level = status.level;
    }
    if (status.sexCategory) {
      updateData.sexCategory = status.sexCategory;
    }
    if (status.weightCategory !== undefined) {
      updateData.weightCategory = status.weightCategory;
    }

    wrap(competitorStatusToUpdate).assign(updateData, {
      mergeObjectProperties: true,
    });

    await this.em.persistAndFlush(competitorStatusToUpdate);

    const competitorStatusUpdated = await this.em.findOne(CompetitorStatus, {
      id: competitorStatusToUpdate.id,
    });

    if (!competitorStatusUpdated) {
      throw new NotFoundException('Competitor status not found');
    }

    return {
      id: competitorStatusUpdated.id,
      level: competitorStatusUpdated.level as string,
      sexCategory: competitorStatusUpdated.sexCategory as string,
      weightCategory: competitorStatusUpdated.weightCategory ?? 0,
      updatedAt: competitorStatusUpdated.updatedAt.toISOString(),
      endDate: competitorStatusUpdated.endDate
        ? competitorStatusUpdated.endDate.toISOString()
        : null,
    };
  }
}
