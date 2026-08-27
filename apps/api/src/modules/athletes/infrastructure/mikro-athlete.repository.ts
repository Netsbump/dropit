import {
  EntityManager,
  EntityRepository,
  type FilterQuery,
} from '@mikro-orm/core';
import { QueryBuilder, SqlEntityManager, raw } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../shared/kernel/identity';
import type { SearchablePaginationQuery } from '../../../shared/kernel/pagination';
import { User } from '../../auth/domain/auth/user.entity';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { CompetitorStatusEntity } from '../../database/entities/competitor-status.entity';
import { PersonalRecordEntity } from '../../database/entities/personal-record.entity';
import { PhysicalMetricEntity } from '../../database/entities/physical-metric.entity';
import {
  IAthleteReadRepository,
  IAthleteRepository,
} from '../application/ports/out/athlete.repository.port';
import type {
  AthleteDetailsReadModel,
  PaginatedAthleteDetailsReadModel,
} from '../application/read-models/athlete-details.read-model';
import { Athlete } from '../domain/athlete';
import type { AthleteId } from '../domain/athlete-id';
import {
  toAthleteDetailsReadModel,
  toAthleteDetailsReadModelList,
} from './mappers/athlete-details-read-model.mapper';
import {
  toAthleteDomain,
  toAthleteDomainList,
  toAthleteEntity,
} from './mappers/athlete.mapper';

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

  private getNameSearchTokens(search?: string): string[] {
    if (!search) {
      return [];
    }

    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      return [];
    }

    return trimmedSearch.split(/\s+/);
  }

  private buildNameSearchFilters(search?: string) {
    const tokens = this.getNameSearchTokens(search);

    return tokens.map((token) => ({
      $or: [
        { firstName: { $ilike: `%${token}%` } },
        { lastName: { $ilike: `%${token}%` } },
      ],
    }));
  }

  private buildListCriteria(
    athleteUserIds: UserId[],
    search?: string
  ): FilterQuery<AthleteEntity> {
    const userFilter: FilterQuery<AthleteEntity> = {
      user: { id: { $in: athleteUserIds } },
    };

    const searchFilters = this.buildNameSearchFilters(search);

    if (searchFilters.length === 0) {
      return userFilter;
    }

    return { $and: [userFilter, ...searchFilters] };
  }

  private applyNameSearch(
    qb: QueryBuilder<AthleteEntity>,
    search?: string
  ): QueryBuilder<AthleteEntity> {
    const searchFilters = this.buildNameSearchFilters(search);

    for (const searchFilter of searchFilters) {
      qb.andWhere(searchFilter);
    }

    return qb;
  }

  private applyStableListOrder(
    qb: QueryBuilder<AthleteEntity>
  ): QueryBuilder<AthleteEntity> {
    return qb.orderBy({
      'a.lastName': 'ASC',
      'a.firstName': 'ASC',
      'a.id': 'ASC',
    });
  }

  private getBaseQuery(
    athleteUserId?: UserId,
    athleteUserIds?: UserId[]
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
        .createQueryBuilder(PhysicalMetricEntity, 'pm')
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
        .createQueryBuilder(PersonalRecordEntity, 'pr_snatch')
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
        .createQueryBuilder(PersonalRecordEntity, 'pr_cj')
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

    // Subqueries for the active competitor status
    qb.addSelect(
      this.sql
        .createQueryBuilder(CompetitorStatusEntity, 'cs_level')
        .select('cs_level.level')
        .where({
          'cs_level.athlete': raw('a.id'),
          'cs_level.endDate': null,
        })
        .orderBy({ 'cs_level.createdAt': 'DESC' })
        .limit(1)
        .as('level')
    );

    // Subquery for the active competitor sex category
    qb.addSelect(
      this.sql
        .createQueryBuilder(CompetitorStatusEntity, 'cs_sex')
        .select('cs_sex.sexCategory')
        .where({
          'cs_sex.athlete': raw('a.id'),
          'cs_sex.endDate': null,
        })
        .orderBy({ 'cs_sex.createdAt': 'DESC' })
        .limit(1)
        .as('sexCategory')
    );

    // Subquery for the active competitor weight category
    qb.addSelect(
      this.sql
        .createQueryBuilder(CompetitorStatusEntity, 'cs_weight')
        .select('cs_weight.weightCategory')
        .where({
          'cs_weight.athlete': raw('a.id'),
          'cs_weight.endDate': null,
        })
        .orderBy({ 'cs_weight.createdAt': 'DESC' })
        .limit(1)
        .as('weightCategory')
    );

    return qb;
  }

  async listDetailsByUserIds(
    athleteUserIds: UserId[],
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel> {
    if (athleteUserIds.length === 0) {
      return {
        data: [],
        pagination: {
          limit: query.limit,
          offset: query.offset,
          total: 0,
          hasNext: false,
        },
      };
    }

    const qb = this.getBaseQuery(undefined, athleteUserIds);

    this.applyNameSearch(qb, query.search);

    this.applyStableListOrder(qb).limit(query.limit).offset(query.offset);

    const [athletes, total] = await Promise.all([
      qb.execute('all'),
      this.em.count(
        AthleteEntity,
        this.buildListCriteria(athleteUserIds, query.search)
      ),
    ]);

    const data = toAthleteDetailsReadModelList(athletes);

    return {
      data,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
        hasNext: query.offset + data.length < total,
      },
    };
  }

  async findDetailsByUserId(
    athleteUserId: UserId
  ): Promise<AthleteDetailsReadModel | null> {
    const athletes = await this.getBaseQuery(athleteUserId, undefined).execute(
      'all'
    );

    const athlete = athletes[0];

    return athlete ? toAthleteDetailsReadModel(athlete) : null;
  }

  async findById(athleteId: AthleteId): Promise<Athlete | null> {
    const athleteEntity = await this.em.findOne(
      AthleteEntity,
      { id: athleteId },
      { populate: ['user.id'] }
    );

    return athleteEntity ? toAthleteDomain(athleteEntity) : null;
  }

  async findByUserId(userId: UserId): Promise<Athlete | null> {
    const athleteEntity = await this.em.findOne(
      AthleteEntity,
      { user: { id: userId } },
      { populate: ['user.id'] }
    );

    return athleteEntity ? toAthleteDomain(athleteEntity) : null;
  }

  async listByIds(athleteIds: string[]): Promise<Athlete[]> {
    if (athleteIds.length === 0) {
      return [];
    }

    const athleteEntities = await this.em.find(
      AthleteEntity,
      { id: { $in: athleteIds } },
      { populate: ['user.id'] }
    );

    return toAthleteDomainList(athleteEntities);
  }

  async listByUserIds(athleteUserIds: UserId[]): Promise<Athlete[]> {
    if (athleteUserIds.length === 0) {
      return [];
    }

    const athleteEntities = await this.em.find(
      AthleteEntity,
      { user: { id: { $in: athleteUserIds } } },
      { populate: ['user.id'] }
    );

    return toAthleteDomainList(athleteEntities);
  }

  async add(athlete: Athlete): Promise<Athlete> {
    const athleteEntity = toAthleteEntity(athlete);
    this.assignAthlete(athleteEntity, athlete);

    await this.em.persistAndFlush(athleteEntity);

    return toAthleteDomain(athleteEntity);
  }

  async save(athlete: Athlete): Promise<Athlete> {
    const athleteEntity = await this.em.findOneOrFail(AthleteEntity, {
      id: athlete.id,
    });
    this.assignAthlete(athleteEntity, athlete);

    await this.em.persistAndFlush(athleteEntity);

    return toAthleteDomain(athleteEntity);
  }

  private assignAthlete(athleteEntity: AthleteEntity, athlete: Athlete): void {
    athleteEntity.firstName = athlete.firstName;
    athleteEntity.lastName = athlete.lastName;
    athleteEntity.birthday = athlete.birthday;
    athleteEntity.country = athlete.country;
    athleteEntity.user = this.em.getReference(User, athlete.userId);
  }

  async remove(athlete: Athlete) {
    const entity = this.em.getReference(AthleteEntity, athlete.id);

    return await this.em.removeAndFlush(entity);
  }
}
