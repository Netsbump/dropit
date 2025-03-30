import { CreateAthlete } from '@dropit/schemas';
import {
  EntityManager,
  EntityRepository,
  QueryBuilder,
} from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { CompetitorStatus } from '../../entities/competitor-status.entity';
import { PersonalRecord } from '../../entities/personal-record.entity';
import { PhysicalMetric } from '../../entities/physical-metric.entity';

export interface AthleteWithDetails extends Athlete {
  pm?: PhysicalMetric;
  pr?: PersonalRecord[];
  cs?: CompetitorStatus;
}

@Injectable()
export class AthleteRepository extends EntityRepository<Athlete> {
  constructor(public readonly em: EntityManager) {
    super(em, Athlete);
  }

  private getBaseQuery(): QueryBuilder<AthleteWithDetails> {
    const qb = this.em.createQueryBuilder(Athlete, 'a');

    qb.select([
      'a.id',
      'a.firstName',
      'a.lastName',
      'a.birthday',
      'a.country',
      'u.email',
      'pm.weight',
      'pr.weight as pr_weight',
      'e.name',
      'e.englishName',
      'e.shortName',
      'cs.level',
      'cs.sexCategory',
      'cs.weightCategory',
    ]);

    // Si 'user' est vraiment une relation déclarée dans l'entité Athlete, ok :
    qb.leftJoin('a.user', 'u');

    // Pour les "tables brutes" non mappées comme relation, on fait :
    qb.leftJoin('physicalMetrics', 'pm').andWhere(
      'pm.end_date is null or pm.end_date is not null'
    );
    qb.leftJoin('personalRecords', 'pr')
      .leftJoin('pr.exercise', 'e')
      .andWhere(
        '(e.english_name = ? or e.english_name = ? or e.english_name is null)',
        ['snatch', 'cleanAndJerk']
      );
    qb.leftJoin('competitorStatuses', 'cs').andWhere(
      'cs.end_date is null or cs.end_date is not null'
    );

    return qb;
  }

  async findAllWithDetails(): Promise<AthleteWithDetails[]> {
    const athletes = await this.getBaseQuery().getResult();
    return athletes;
  }

  async findById(id: string): Promise<AthleteWithDetails> {
    const athlete = await this.getBaseQuery()
      .where({ 'a.id': id })
      .getSingleResult();

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    return athlete;
  }

  async createAthlete(data: CreateAthlete): Promise<AthleteWithDetails> {
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);
    athlete.country = data.country;

    await this.em.persistAndFlush(athlete);
    return this.findById(athlete.id);
  }

  async updateAthlete(
    id: string,
    data: Partial<CreateAthlete>
  ): Promise<AthleteWithDetails> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    if (data.firstName !== undefined) {
      athlete.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      athlete.lastName = data.lastName;
    }

    if (data.birthday !== undefined) {
      athlete.birthday = new Date(data.birthday);
    }

    if (data.country !== undefined) {
      athlete.country = data.country;
    }

    await this.em.persistAndFlush(athlete);
    return this.findById(athlete.id);
  }

  async deleteAthlete(id: string): Promise<void> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (athlete) {
      await this.em.removeAndFlush(athlete);
    }
  }
}
