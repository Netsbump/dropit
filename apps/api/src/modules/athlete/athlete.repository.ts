import { CreateAthlete } from '@dropit/schemas';
import {
  EntityManager,
  EntityRepository,
  QueryBuilder,
} from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';

@Injectable()
export class AthleteRepository extends EntityRepository<Athlete> {
  constructor(public readonly em: EntityManager) {
    super(em, Athlete);
  }

  private getBaseQuery(): QueryBuilder<Athlete> {
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

    qb.leftJoinAndSelect('a.user', 'u');

    qb.leftJoinAndSelect('a.physicalMetrics', 'pm')
    
    qb.leftJoinAndSelect('a.personalRecords', 'pr')
      .leftJoinAndSelect('pr.exercise', 'e')
      .andWhere(
        '(e.english_name = ? or e.english_name = ? or e.english_name is null)',
        ['snatch', 'cleanAndJerk']
      );

    qb.leftJoinAndSelect('a.competitorStatuses', 'cs')

    return qb;
  }

  async findAllWithDetails(): Promise<Athlete[]> {

    const athletes = await this.getBaseQuery().getResult();

    return athletes;
  }

  async findById(id: string): Promise<Athlete> {
    const athlete = await this.getBaseQuery()
      .where({ 'a.id': id })
      .getSingleResult();

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    return athlete;
  }

  async createAthlete(data: CreateAthlete): Promise<Athlete> {
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
  ): Promise<Athlete> {
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
