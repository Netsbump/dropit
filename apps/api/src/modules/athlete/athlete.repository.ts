import { CreateAthlete } from '@dropit/schemas';
import {
  EntityManager,
  EntityRepository,
  QueryBuilder,
} from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';

interface PhysicalMetric {
  weight?: number;
}

interface PersonalRecord {
  weight: number;
  e: {
    englishName: string;
  };
}

interface CompetitorStatus {
  level: string;
  sexCategory: string;
  weightCategory?: number;
}

interface TransformedAthlete extends Athlete {
  metrics?: { weight?: number };
  personalRecords?: {
    snatch?: number;
    cleanAndJerk?: number;
  };
  competitorStatus?: {
    level: string;
    sexCategory: string;
    weightCategory?: number;
  };
}

export interface AthleteWithDetails extends Athlete {
  pm?: PhysicalMetric;
  pr?: PersonalRecord[];
  cs?: CompetitorStatus;
}

export class AthleteRepository extends EntityRepository<Athlete> {
  constructor(protected readonly em: EntityManager) {
    super(em, Athlete);
  }

  private async getAthleteDetailsQuery(
    id: string
  ): Promise<QueryBuilder<Athlete>> {
    const qb = this.createQueryBuilder('a');
    return qb
      .select([
        'a.id',
        'a.firstName',
        'a.lastName',
        'a.birthday',
        'a.country',
        'pm.weight',
        'pr.weight',
        'e.englishName',
        'cs.level',
        'cs.sexCategory',
        'cs.weightCategory',
      ])
      .leftJoinAndSelect('a.user', 'u')
      .leftJoin('physical_metric', 'pm', { 'pm.athlete_id': 'a.id' })
      .leftJoin('personal_record', 'pr', { 'pr.athlete_id': 'a.id' })
      .leftJoin('exercise', 'e', { 'e.id': 'pr.exercise_id' })
      .leftJoin('competitor_status', 'cs', { 'cs.athlete_id': 'a.id' })
      .where({
        'a.id': id,
        'pm.endDate': null,
        'cs.endDate': null,
      })
      .andWhere({
        $or: [
          { 'e.englishName': 'snatch' },
          { 'e.englishName': 'cleanAndJerk' },
        ],
      });
  }

  async findAllWithDetails(): Promise<TransformedAthlete[]> {
    const qb = this.createQueryBuilder('a');

    const athletes = await qb
      .select([
        'a.id',
        'a.firstName',
        'a.lastName',
        'a.birthday',
        'a.country',
        'pm.weight',
        'pr.weight',
        'e.englishName',
        'cs.level',
        'cs.sexCategory',
        'cs.weightCategory',
      ])
      .leftJoinAndSelect('a.user', 'u')
      .leftJoin('physical_metric', 'pm', { 'pm.athlete_id': 'a.id' })
      .leftJoin('personal_record', 'pr', { 'pr.athlete_id': 'a.id' })
      .leftJoin('exercise', 'e', { 'e.id': 'pr.exercise_id' })
      .leftJoin('competitor_status', 'cs', { 'cs.athlete_id': 'a.id' })
      .where({
        'pm.endDate': null,
        'cs.endDate': null,
      })
      .andWhere({
        $or: [
          { 'e.englishName': 'snatch' },
          { 'e.englishName': 'cleanAndJerk' },
        ],
      })
      .getResult();

    // Transform the results to match the expected format
    return athletes.map((athlete) => {
      const { pm, pr, cs, ...rest } = athlete as unknown as AthleteWithDetails;

      // Transform personal records into a single object
      const personalRecords = pr
        ? pr.reduce(
            (acc, record) => {
              if (record.e.englishName === 'snatch') {
                acc.snatch = record.weight;
              } else if (record.e.englishName === 'cleanAndJerk') {
                acc.cleanAndJerk = record.weight;
              }
              return acc;
            },
            {} as { snatch?: number; cleanAndJerk?: number }
          )
        : undefined;

      return {
        ...rest,
        metrics: pm ? { weight: pm.weight } : undefined,
        personalRecords,
        competitorStatus: cs
          ? {
              level: cs.level,
              sexCategory: cs.sexCategory,
              weightCategory: cs.weightCategory,
            }
          : undefined,
      };
    });
  }

  async findById(id: string): Promise<TransformedAthlete> {
    const qb = await this.getAthleteDetailsQuery(id);
    const athlete = await qb.getSingleResult();

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    const { pm, pr, cs, ...rest } = athlete as unknown as AthleteWithDetails;

    // Transform personal records into a single object
    const personalRecords = pr
      ? pr.reduce(
          (acc, record) => {
            if (record.e.englishName === 'snatch') {
              acc.snatch = record.weight;
            } else if (record.e.englishName === 'cleanAndJerk') {
              acc.cleanAndJerk = record.weight;
            }
            return acc;
          },
          {} as { snatch?: number; cleanAndJerk?: number }
        )
      : undefined;

    return {
      ...rest,
      metrics: pm ? { weight: pm.weight } : undefined,
      personalRecords,
      competitorStatus: cs
        ? {
            level: cs.level,
            sexCategory: cs.sexCategory,
            weightCategory: cs.weightCategory,
          }
        : undefined,
    };
  }

  async createAthlete(data: CreateAthlete): Promise<Athlete> {
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);
    athlete.country = data.country;

    await this.em.persistAndFlush(athlete);

    const qb = await this.getAthleteDetailsQuery(athlete.id);
    return await qb.getSingleResult();
  }

  async updateAthlete(
    id: string,
    data: Partial<CreateAthlete>
  ): Promise<Athlete> {
    const athlete = await this.findOne({ id });
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

    const qb = await this.getAthleteDetailsQuery(athlete.id);
    return await qb.getSingleResult();
  }

  async deleteAthlete(id: string): Promise<void> {
    const athlete = await this.findOne({ id });
    if (athlete) {
      await this.em.removeAndFlush(athlete);
    }
  }
}
