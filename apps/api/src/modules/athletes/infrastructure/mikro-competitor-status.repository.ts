import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { CompetitorStatusEntity } from '../../database/entities/competitor-status.entity';
import type { ICompetitorStatusRepository } from '../application/ports/out/competitor-status.repository.port';
import type { AthleteId } from '../domain/athlete-id';
import type { CompetitorStatus } from '../domain/competitor-status';
import type { CompetitorStatusId } from '../domain/competitor-status-id';
import {
  toCompetitorStatusDomain,
  toCompetitorStatusDomainList,
} from './mappers/competitor-status.mapper';

@Injectable()
export class MikroCompetitorStatusRepository
  extends EntityRepository<CompetitorStatusEntity>
  implements ICompetitorStatusRepository
{
  constructor(public readonly em: EntityManager) {
    super(em, CompetitorStatusEntity);
  }

  async findById(id: CompetitorStatusId): Promise<CompetitorStatus | null> {
    const competitorStatusEntity = await this.findCompetitorStatusById(id);

    return competitorStatusEntity
      ? toCompetitorStatusDomain(competitorStatusEntity)
      : null;
  }

  async findActiveByAthleteId(
    athleteId: AthleteId
  ): Promise<CompetitorStatus | null> {
    const competitorStatusEntity = await this.em.findOne(
      CompetitorStatusEntity,
      { athlete: { id: athleteId }, endDate: null },
      { populate: ['athlete'] }
    );

    return competitorStatusEntity
      ? toCompetitorStatusDomain(competitorStatusEntity)
      : null;
  }

  async listByAthleteUserIds(
    athleteUserIds: string[]
  ): Promise<CompetitorStatus[]> {
    if (athleteUserIds.length === 0) {
      return [];
    }

    const competitorStatusEntities = await this.em.find(
      CompetitorStatusEntity,
      {
        athlete: {
          user: { id: { $in: athleteUserIds } },
        },
      },
      { populate: ['athlete'] }
    );

    return toCompetitorStatusDomainList(competitorStatusEntities);
  }

  async add(competitorStatus: CompetitorStatus): Promise<CompetitorStatus> {
    const competitorStatusEntity = new CompetitorStatusEntity();
    competitorStatusEntity.id = competitorStatus.id;
    this.assignCompetitorStatus(competitorStatusEntity, competitorStatus);

    await this.em.persistAndFlush(competitorStatusEntity);

    const savedCompetitorStatusEntity = await this.findCompetitorStatusById(
      competitorStatusEntity.id
    );

    if (!savedCompetitorStatusEntity) {
      throw new Error('Competitor status not found after add');
    }

    return toCompetitorStatusDomain(savedCompetitorStatusEntity);
  }

  async save(competitorStatus: CompetitorStatus): Promise<CompetitorStatus> {
    const competitorStatusEntity = await this.em.findOneOrFail(
      CompetitorStatusEntity,
      { id: competitorStatus.id }
    );
    this.assignCompetitorStatus(competitorStatusEntity, competitorStatus);

    await this.em.persistAndFlush(competitorStatusEntity);

    const savedCompetitorStatusEntity = await this.findCompetitorStatusById(
      competitorStatusEntity.id
    );

    if (!savedCompetitorStatusEntity) {
      throw new Error('Competitor status not found after save');
    }

    return toCompetitorStatusDomain(savedCompetitorStatusEntity);
  }

  private assignCompetitorStatus(
    competitorStatusEntity: CompetitorStatusEntity,
    competitorStatus: CompetitorStatus
  ): void {
    competitorStatusEntity.level = competitorStatus.level;
    competitorStatusEntity.sexCategory = competitorStatus.sexCategory;
    competitorStatusEntity.weightCategory = competitorStatus.weightCategory;
    competitorStatusEntity.endDate = competitorStatus.endDate;
    competitorStatusEntity.athlete = this.em.getReference(
      AthleteEntity,
      competitorStatus.athleteId
    );
  }

  async remove(competitorStatus: CompetitorStatus): Promise<void> {
    const competitorStatusEntity = this.em.getReference(
      CompetitorStatusEntity,
      competitorStatus.id
    );

    await this.em.removeAndFlush(competitorStatusEntity);
  }

  private async findCompetitorStatusById(
    id: CompetitorStatusId | string
  ): Promise<CompetitorStatusEntity | null> {
    return await this.em.findOne(
      CompetitorStatusEntity,
      { id },
      { populate: ['athlete'] }
    );
  }
}
