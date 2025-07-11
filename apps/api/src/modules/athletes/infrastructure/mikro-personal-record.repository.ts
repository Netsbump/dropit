import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { PersonalRecord } from '../domain/personal-record.entity';
import { IPersonalRecordRepository } from '../application/ports/personal-record.repository';

@Injectable()
export class MikroPersonalRecordRepository extends EntityRepository<PersonalRecord> implements IPersonalRecordRepository {
  constructor(public readonly em: EntityManager) {
    super(em, PersonalRecord);
  }

  async getOne(id: string): Promise<PersonalRecord | null> {
    return await this.em.findOne(PersonalRecord, { id }, {
      populate: ['athlete', 'exercise'],
    });
  }

  async getAll(athleteUserIds: string[]): Promise<PersonalRecord[]> {
    return await this.em.find(PersonalRecord, { athlete: { $in: athleteUserIds } }, {
      populate: ['athlete', 'exercise'],
    });
  }

  async getAllByAthleteId(athleteId: string): Promise<PersonalRecord[]> {
    return await this.em.find(PersonalRecord, { athlete: athleteId }, {
      populate: ['exercise'],
    });
  }

  async save(personalRecord: PersonalRecord): Promise<void> {
    return await this.em.persistAndFlush(personalRecord);
  }

  async remove(personalRecord: PersonalRecord): Promise<void> {
    return await this.em.removeAndFlush(personalRecord);
  }
}
