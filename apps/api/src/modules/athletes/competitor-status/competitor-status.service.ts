import {
  CompetitorStatusDto,
  CreateCompetitorStatus,
  UpdateCompetitorStatus,
} from '@dropit/schemas';
import { CompetitorLevel, SexCategory } from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../athlete/domain/athlete.entity';
import { CompetitorStatus } from './competitor-status.entity';

@Injectable()
export class CompetitorStatusService {
  constructor(private readonly em: EntityManager) {}

  async getCompetitorStatuses(): Promise<CompetitorStatusDto[]> {
    const competitorStatuses = await this.em.findAll(CompetitorStatus, {
      populate: ['athlete'],
    });

    if (!competitorStatuses || competitorStatuses.length === 0) {
      throw new NotFoundException('No competitor statuses found');
    }

    return competitorStatuses.map((status) => {
      return {
        id: status.id,
        level: status.level as string,
        sexCategory: status.sexCategory as string,
        weightCategory: status.weightCategory ?? 0,
        updatedAt: status.updatedAt.toISOString(),
        endDate: status.endDate ? status.endDate.toISOString() : null,
      };
    });
  }

  async getCompetitorStatus(id: string): Promise<CompetitorStatusDto> {
    const competitorStatus = await this.em.findOne(
      CompetitorStatus,
      { athlete: id, endDate: null },
      {
        populate: ['athlete'],
      }
    );

    if (!competitorStatus) {
      throw new NotFoundException(
        `Active competitor status for athlete with ID ${id} not found`
      );
    }

    return {
      id: competitorStatus.id,
      level: competitorStatus.level as string,
      sexCategory: competitorStatus.sexCategory as string,
      weightCategory: competitorStatus.weightCategory ?? 0,
      updatedAt: competitorStatus.updatedAt.toISOString(),
      endDate: competitorStatus.endDate
        ? competitorStatus.endDate.toISOString()
        : null,
    };
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
