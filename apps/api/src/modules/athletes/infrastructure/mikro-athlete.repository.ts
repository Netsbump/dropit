import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { QueryBuilder, SqlEntityManager, raw } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { Athlete } from '../domain/athlete';
import { User } from '../../auth/domain/auth/user.entity';
import {
  toAthleteDomain,
  toAthleteDomainList,
  toAthleteEntity,
} from './mappers/athlete.mapper';
import { PersonalRecord } from '../domain/personal-record.entity';
import type { AthleteDetailsReadModel } from '../application/read-models/athlete-details.read-model';
import {
  IAthleteReadRepository,
  IAthleteRepository,
} from '../application/ports/athlete.repository.port';
import {
  toAthleteDetailsReadModel,
  toAthleteDetailsReadModelList,
} from './mappers/athlete-details-read-model.mapper';

@Injectable()
export class MikroAthleteRepository
  extends EntityRepository<AthleteEntity>
  implements IAthleteRepository, IAthleteReadRepository
{
  constructor(public readonly em: EntityManager) {
    super(em, AthleteEntity);
  }

  // helper to avoid casting everywhere
  private get sql(): SqlEntityManager {
    return this.em as unknown as SqlEntityManager;
  }

  private getBaseQuery(
    athleteUserId?: string,
    athleteUserIds?: string[]
  ): QueryBuilder<AthleteEntity> {
    const qb = this.sql.createQueryBuilder(AthleteEntity, 'a');

    qb.select([
      'a.id AS id',
      'a.firstName',
      'a.lastName',
      'a.birthday',
      'a.country',
      'u.id AS userId',
      'u.email',
      'u.image',
      'cs.level',
      'cs.sexCategory',
      'cs.weightCategory',
    ]);

    // Filter by organization (always applied)
    if (athleteUserIds) {
      qb.where({ 'u.id': { $in: athleteUserIds } });
    }

    if (athleteUserId) {
      qb.where({ 'u.id': { $in: [athleteUserId] } });
    }

    qb.leftJoin('a.user', 'u');

    // Get the most recent date
    const today = new Date().toISOString();

    // Subquery to get the physical metric closest to today
    qb.addSelect(
      this.sql
        .createQueryBuilder('PhysicalMetric', 'pm')
        .select('pm.weight')
        .where({ 'pm.athlete': raw('a.id') })
        .orderBy([
          { [raw(`ABS(EXTRACT(EPOCH FROM (pm.date - '${today}')))`)]: 'ASC' },
        ])
        .limit(1)
        .as('pm_weight')
    );

    // Subquery for the latest Snatch PR
    qb.addSelect(
      this.sql
        .createQueryBuilder(PersonalRecord, 'pr_snatch')
        .select('pr_snatch.weight')
        .leftJoin('pr_snatch.exercise', 'e_snatch')
        .where({
          'pr_snatch.athlete': raw('a.id'),
          'e_snatch.english_name': 'snatch',
        })
        .orderBy({ 'pr_snatch.createdAt': 'DESC' })
        .limit(1)
        .as('pr_snatch')
    );

    // Subquery for the latest Clean & Jerk PR
    qb.addSelect(
      this.sql
        .createQueryBuilder(PersonalRecord, 'pr_cj')
        .select('pr_cj.weight')
        .leftJoin('pr_cj.exercise', 'e_cj')
        .where({
          'pr_cj.athlete': raw('a.id'),
          'e_cj.english_name': 'cleanAndJerk',
        })
        .orderBy({ 'pr_cj.createdAt': 'DESC' })
        .limit(1)
        .as('pr_cleanAndJerk')
    );

    qb.leftJoin('a.competitorStatuses', 'cs');

    return qb;
  }

  async listDetailsByUserIds(
    athleteUserIds: string[]
  ): Promise<AthleteDetailsReadModel[]> {
    // Get raw results (table format, non-hydrated) via execute('all')
    const athletes = await this.getBaseQuery(undefined, athleteUserIds).execute(
      'all'
    );
    return toAthleteDetailsReadModelList(athletes);
  }

  async findDetailsByUserId(
    athleteUserId: string
  ): Promise<AthleteDetailsReadModel | null> {
    const athletes = await this.getBaseQuery(athleteUserId, undefined).execute(
      'all'
    );

    const athlete = athletes[0];

    return athlete ? toAthleteDetailsReadModel(athlete) : null;
  }

  async findById(athleteId: string): Promise<Athlete | null> {
    const athleteEntity = await this.em.findOne(
      AthleteEntity,
      { id: athleteId },
      { populate: ['user.id'] }
    );

    return athleteEntity ? toAthleteDomain(athleteEntity) : null;
  }

  async findByUserId(userId: string): Promise<Athlete | null> {
    const athleteEntity = await this.em.findOne(
      AthleteEntity,
      { user: { id: userId } },
      { populate: ['user.id'] }
    );

    return athleteEntity ? toAthleteDomain(athleteEntity) : null;
  }

  async listByIds(athleteIds: string[]): Promise<Athlete[]> {
    const athleteEntities = await this.em.find(
      AthleteEntity,
      { id: { $in: athleteIds } },
      { populate: ['user.id'] }
    );

    return toAthleteDomainList(athleteEntities);
  }

  async listByUserIds(athleteUserIds: string[]): Promise<Athlete[]> {
    const athleteEntities = await this.em.find(
      AthleteEntity,
      { user: { id: { $in: athleteUserIds } } },
      { populate: ['user.id'] }
    );

    return toAthleteDomainList(athleteEntities);
  }

  async save(athlete: Athlete): Promise<Athlete> {
    const athleteEntity = athlete.id
      ? await this.em.findOneOrFail(AthleteEntity, { id: athlete.id })
      : toAthleteEntity(athlete);

    athleteEntity.firstName = athlete.firstName;
    athleteEntity.lastName = athlete.lastName;
    athleteEntity.birthday = athlete.birthday;
    athleteEntity.country = athlete.country;
    athleteEntity.user = this.em.getReference(User, athlete.userId);

    await this.em.persistAndFlush(athleteEntity);

    return toAthleteDomain(athleteEntity);
  }

  async remove(athlete: Athlete) {
    if (!athlete.id) {
      throw new Error('Cannot remove athlete without id');
    }

    const entity = this.em.getReference(AthleteEntity, athlete.id);

    return await this.em.removeAndFlush(entity);
  }
}
