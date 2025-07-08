import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { QueryBuilder, SqlEntityManager, raw } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PersonalRecord } from '../../../../performance/personal-record/personal-record.entity';
import { Athlete } from '../../domain/athlete.entity';
import { AthleteReadRepository, AthleteDetails } from '../../application/ports/athlete-read.repository';

@Injectable()
export class MikroAthleteReadRepository extends EntityRepository<Athlete> implements AthleteReadRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Athlete);
  }

  // helper to avoid casting everywhere
  private get sql(): SqlEntityManager {
    return this.em as unknown as SqlEntityManager;
  }

  private getBaseQuery(id?: string, athleteUserIds?: string[]): QueryBuilder<Athlete> {
    const qb = this.sql.createQueryBuilder(Athlete, 'a');

    qb.select([
      'a.id AS id',
      'a.firstName',
      'a.lastName',
      'a.birthday',
      'a.country',
      'u.id',
      'u.email',
      'u.image',
      'cs.level',
      'cs.sexCategory',
      'cs.weightCategory',
    ]);


    // Filtrage par organisation (toujours appliqué)
    if (athleteUserIds) {
      qb.where({ 'u.id': { $in: athleteUserIds } });
    }

    if (id) {
      qb.where({ 'a.id': id });
    }

    qb.leftJoin('a.user', 'u');

    // récupère la date la plus récente
    const today = new Date().toISOString();

    // Sous-requête pour récupérer la métrique physique la plus proche de aujourd'hui
    qb.addSelect(
      this.sql
        .createQueryBuilder('PhysicalMetric', 'pm')
        .select('pm.weight')
        .where({ 'pm.athlete': raw('a.id') })
        .orderBy([
          { [raw(`ABS(EXTRACT(EPOCH FROM (pm.date - '${today}')))`)]: 'ASC' }
        ])
        .limit(1)
        .as('pm_weight')
    );

    // Sous-requête pour le dernier PR de Snatch
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

    // Sous-requête pour le dernier PR de Clean & Jerk
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

  async findAllWithDetails(athleteUserIds: string[]): Promise<AthleteDetails[]> {
    // Récupère les résultats bruts (format "table", non-hydratés) via execute('all'). durée 4ms.
    const athletes = await this.getBaseQuery(undefined, athleteUserIds).execute('all');
    return athletes as AthleteDetails[];
  }

  async findOneWithDetails(athleteId: string): Promise<AthleteDetails> {
    const athletes = await this.getBaseQuery(athleteId, undefined).execute('all');

    if (!athletes || athletes.length === 0) {
      throw new NotFoundException('Athlete not found');
    }

    return athletes[0] as AthleteDetails;
  }

  async getOne(athleteId: string): Promise<Athlete | null> {
    return await this.em.findOne(Athlete, { id: athleteId });
  }

  async getAll(athleteUserIds: string[]): Promise<Athlete[]> {
    return await this.em.find(Athlete, { id: { $in: athleteUserIds } });
  }
}
