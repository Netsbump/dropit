import { CreateAthlete } from '@dropit/schemas';
import {
  EntityManager,
  EntityRepository,
  QueryBuilder,
  raw,
} from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { PersonalRecord } from '../../entities/personal-record.entity';

export type AthleteBasics = Pick<
  Athlete,
  'id' | 'firstName' | 'lastName' | 'birthday' | 'country' | 'club'
>;

export type AthleteDetails = AthleteBasics & {
  email: string;
  avatar: string;
  weight: number;
  level: string;
  sex_category: string;
  weight_category: string;
  pr_snatch?: number;
  pr_cleanAndJerk?: number;
};
@Injectable()
export class AthleteRepository extends EntityRepository<Athlete> {
  constructor(public readonly em: EntityManager) {
    super(em, Athlete);
  }

  private getBaseQuery(id?: string): QueryBuilder<Athlete> {
    const qb = this.em.createQueryBuilder(Athlete, 'a');

    qb.select([
      'a.id AS id',
      'a.firstName',
      'a.lastName',
      'a.birthday',
      'a.country',
      'c.id AS club_id',
      'u.email',
      'u.avatar',
      'pm.weight',
      'cs.level',
      'cs.sexCategory',
      'cs.weightCategory',
    ]);

    if (id) {
      console.log('on rentre dans le if avec id', id);
      qb.where({ 'a.id': id });
    }

    qb.leftJoin('a.user', 'u');
    qb.leftJoin('a.club', 'c');
    qb.leftJoin('a.physicalMetrics', 'pm', { 'pm.endDate': null });

    // Sous-requête pour le dernier PR de Snatch
    qb.addSelect(
      this.em
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
      this.em
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

  async findAllWithDetails(): Promise<AthleteDetails[]> {
    // Récupère les résultats bruts (format "table", non-hydratés) via execute('all'). durée 4ms.
    const athletes = await this.getBaseQuery().execute('all');
    return athletes as AthleteDetails[];
  }

  async findOneWithDetails(id: string): Promise<AthleteDetails> {
    const athletes = await this.getBaseQuery(id).execute('all');

    if (!athletes || athletes.length === 0) {
      throw new NotFoundException('Athlete not found');
    }

    return athletes[0] as AthleteDetails;
  }

  async createAthlete(data: CreateAthlete): Promise<AthleteDetails> {
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);
    athlete.country = data.country;

    await this.em.persistAndFlush(athlete);
    return this.findOneWithDetails(athlete.id);
  }

  async updateAthlete(
    id: string,
    data: Partial<CreateAthlete>
  ): Promise<AthleteDetails> {
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
    return this.findOneWithDetails(athlete.id);
  }

  async deleteAthlete(id: string): Promise<void> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (athlete) {
      await this.em.removeAndFlush(athlete);
    }
  }
}
