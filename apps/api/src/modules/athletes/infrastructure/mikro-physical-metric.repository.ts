import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { PhysicalMetricEntity } from '../../database/entities/physical-metric.entity';
import type { IPhysicalMetricRepository } from '../application/ports/out/physical-metric.repository.port';
import type { AthleteId } from '../domain/athlete-id';
import type { PhysicalMetric } from '../domain/physical-metric';
import type { PhysicalMetricId } from '../domain/physical-metric-id';
import {
  toPhysicalMetricDomain,
  toPhysicalMetricDomainList,
} from './mappers/physical-metric.mapper';

@Injectable()
export class MikroPhysicalMetricRepository
  extends EntityRepository<PhysicalMetricEntity>
  implements IPhysicalMetricRepository
{
  constructor(public readonly em: EntityManager) {
    super(em, PhysicalMetricEntity);
  }

  async findById(id: PhysicalMetricId): Promise<PhysicalMetric | null> {
    const physicalMetricEntity = await this.findPhysicalMetricById(id);

    return physicalMetricEntity
      ? toPhysicalMetricDomain(physicalMetricEntity)
      : null;
  }

  async listByAthleteId(athleteId: AthleteId): Promise<PhysicalMetric[]> {
    const physicalMetricEntities = await this.em.find(
      PhysicalMetricEntity,
      { athlete: { id: athleteId } },
      {
        populate: ['athlete'],
        orderBy: { date: 'DESC' },
      }
    );

    return toPhysicalMetricDomainList(physicalMetricEntities);
  }

  async save(physicalMetric: PhysicalMetric): Promise<PhysicalMetric> {
    const physicalMetricEntity = physicalMetric.id
      ? await this.em.findOneOrFail(PhysicalMetricEntity, {
          id: physicalMetric.id,
        })
      : new PhysicalMetricEntity();

    physicalMetricEntity.weight = physicalMetric.weight;
    physicalMetricEntity.height = physicalMetric.height;
    physicalMetricEntity.date = physicalMetric.date;
    physicalMetricEntity.athlete = this.em.getReference(
      AthleteEntity,
      physicalMetric.athleteId
    );

    await this.em.persistAndFlush(physicalMetricEntity);

    const savedPhysicalMetricEntity = await this.findPhysicalMetricById(
      physicalMetricEntity.id
    );

    if (!savedPhysicalMetricEntity) {
      throw new Error('Physical metric not found after save');
    }

    return toPhysicalMetricDomain(savedPhysicalMetricEntity);
  }

  async remove(physicalMetric: PhysicalMetric): Promise<void> {
    if (!physicalMetric.id) {
      throw new Error('Cannot remove physical metric without id');
    }

    const physicalMetricEntity = this.em.getReference(
      PhysicalMetricEntity,
      physicalMetric.id
    );

    await this.em.removeAndFlush(physicalMetricEntity);
  }

  private async findPhysicalMetricById(
    id: PhysicalMetricId | string
  ): Promise<PhysicalMetricEntity | null> {
    return await this.em.findOne(
      PhysicalMetricEntity,
      { id },
      { populate: ['athlete'] }
    );
  }
}
