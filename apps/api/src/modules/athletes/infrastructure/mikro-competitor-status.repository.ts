import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { CompetitorStatusEntity } from '../../database/entities/competitor-status.entity';
import type { ICompetitorStatusRepository } from '../application/ports/out/competitor-status.repository.port';
import type { CompetitorStatus } from '../domain/competitor-status';
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

  async findById(id: string): Promise<CompetitorStatus | null> {
    const competitorStatusEntity = await this.findCompetitorStatusById(id);

    return competitorStatusEntity
      ? toCompetitorStatusDomain(competitorStatusEntity)
      : null;
  }

  async findActiveByAthleteId(
    athleteId: string
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

  async save(competitorStatus: CompetitorStatus): Promise<CompetitorStatus> {
    const competitorStatusEntity = competitorStatus.id
      ? await this.em.findOneOrFail(CompetitorStatusEntity, {
          id: competitorStatus.id,
        })
      : new CompetitorStatusEntity();

    competitorStatusEntity.level = competitorStatus.level;
    competitorStatusEntity.sexCategory = competitorStatus.sexCategory;
    competitorStatusEntity.weightCategory = competitorStatus.weightCategory;
    competitorStatusEntity.endDate = competitorStatus.endDate;
    competitorStatusEntity.athlete = this.em.getReference(
      AthleteEntity,
      competitorStatus.athleteId
    );

    await this.em.persistAndFlush(competitorStatusEntity);

    const savedCompetitorStatusEntity = await this.findCompetitorStatusById(
      competitorStatusEntity.id
    );

    if (!savedCompetitorStatusEntity) {
      throw new Error('Competitor status not found after save');
    }

    return toCompetitorStatusDomain(savedCompetitorStatusEntity);
  }

  async remove(competitorStatus: CompetitorStatus): Promise<void> {
    if (!competitorStatus.id) {
      throw new Error('Cannot remove competitor status without id');
    }

    const competitorStatusEntity = this.em.getReference(
      CompetitorStatusEntity,
      competitorStatus.id
    );

    await this.em.removeAndFlush(competitorStatusEntity);
  }

  private async findCompetitorStatusById(
    id: string
  ): Promise<CompetitorStatusEntity | null> {
    return await this.em.findOne(
      CompetitorStatusEntity,
      { id },
      { populate: ['athlete'] }
    );
  }
}
