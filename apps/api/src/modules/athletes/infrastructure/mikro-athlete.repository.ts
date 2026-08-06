import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { QueryBuilder, SqlEntityManager, raw } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { Athlete } from '../domain/athlete';
import { User } from '../../auth/domain/auth/user.entity';
import { toAthleteDomain, toAthleteEntity } from './athlete.mapper';
import { PersonalRecord } from '../domain/personal-record.entity';
import {
  AthleteDetails,
  IAthleteRepository,
} from '../application/ports/athlete.repository.port';

@Injectable()
export class MikroAthleteRepository
  extends EntityRepository<AthleteEntity>
  implements IAthleteRepository
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

  async findAllWithDetails(
    athleteUserIds: string[]
  ): Promise<AthleteDetails[]> {
    // Get raw results (table format, non-hydrated) via execute('all')
    const athletes = await this.getBaseQuery(undefined, athleteUserIds).execute(
      'all'
    );
    return athletes as AthleteDetails[];
  }

  async findOneWithDetails(athleteUserId: string): Promise<AthleteDetails> {
    const athletes = await this.getBaseQuery(athleteUserId, undefined).execute(
      'all'
    );

    if (!athletes || athletes.length === 0) {
      throw new NotFoundException('Athlete not found');
    }

    return athletes[0] as AthleteDetails;
  }

  async getOne(athleteId: string): Promise<Athlete | null> {
    const entity = await this.em.findOne(
      AthleteEntity,
      { id: athleteId },
      { populate: ['user.id'] }
    );

    return entity ? toAthleteDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Athlete | null> {
    const entity = await this.em.findOne(
      AthleteEntity,
      { user: { id: userId } },
      { populate: ['user.id'] }
    );

    return entity ? toAthleteDomain(entity) : null;
  }

  async getAll(athleteUserIds: string[]): Promise<Athlete[]> {
    const entities = await this.em.find(
      AthleteEntity,
      { user: { id: { $in: athleteUserIds } } },
      { populate: ['user.id'] }
    );

    return entities.map(toAthleteDomain);
  }

  async save(athlete: Athlete): Promise<Athlete> {
    const entity = athlete.id
      ? await this.em.findOneOrFail(AthleteEntity, { id: athlete.id })
      : toAthleteEntity(athlete);

    entity.firstName = athlete.firstName;
    entity.lastName = athlete.lastName;
    entity.birthday = athlete.birthday;
    entity.country = athlete.country;
    entity.user = this.em.getReference(User, athlete.userId);

    await this.em.persistAndFlush(entity);

    return toAthleteDomain(entity);
  }

  async remove(athlete: Athlete) {
    if (!athlete.id) {
      throw new Error('Cannot remove athlete without id');
    }

    const entity = this.em.getReference(AthleteEntity, athlete.id);

    return await this.em.removeAndFlush(entity);
  }
}
