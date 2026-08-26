import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { PersonalRecordEntity } from '../../database/entities/personal-record.entity';
import { Exercise } from '../../training/domain/exercise.entity';
import type { IPersonalRecordRepository } from '../application/ports/out/personal-record.repository.port';
import type { AthleteId } from '../domain/athlete-id';
import type { PersonalRecord } from '../domain/personal-record';
import type { PersonalRecordId } from '../domain/personal-record-id';
import {
  toPersonalRecordDomain,
  toPersonalRecordDomainList,
} from './mappers/personal-record.mapper';

@Injectable()
export class MikroPersonalRecordRepository
  extends EntityRepository<PersonalRecordEntity>
  implements IPersonalRecordRepository
{
  constructor(public readonly em: EntityManager) {
    super(em, PersonalRecordEntity);
  }

  async findById(id: PersonalRecordId): Promise<PersonalRecord | null> {
    const personalRecordEntity = await this.findPersonalRecordById(id);

    return personalRecordEntity
      ? toPersonalRecordDomain(personalRecordEntity)
      : null;
  }

  async listByAthleteUserIds(
    athleteUserIds: string[]
  ): Promise<PersonalRecord[]> {
    if (athleteUserIds.length === 0) {
      return [];
    }

    const personalRecordEntities = await this.em.find(
      PersonalRecordEntity,
      { athlete: { user: { id: { $in: athleteUserIds } } } },
      {
        populate: ['athlete', 'exercise'],
      }
    );

    return toPersonalRecordDomainList(personalRecordEntities);
  }

  async listByAthleteId(athleteId: AthleteId): Promise<PersonalRecord[]> {
    const personalRecordEntities = await this.em.find(
      PersonalRecordEntity,
      { athlete: athleteId },
      {
        populate: ['athlete', 'exercise'],
      }
    );

    return toPersonalRecordDomainList(personalRecordEntities);
  }

  async add(personalRecord: PersonalRecord): Promise<PersonalRecord> {
    const personalRecordEntity = new PersonalRecordEntity();
    personalRecordEntity.id = personalRecord.id;
    this.assignPersonalRecord(personalRecordEntity, personalRecord);

    await this.em.persistAndFlush(personalRecordEntity);

    const savedPersonalRecordEntity = await this.findPersonalRecordById(
      personalRecordEntity.id
    );

    if (!savedPersonalRecordEntity) {
      throw new Error('Personal record not found after add');
    }

    return toPersonalRecordDomain(savedPersonalRecordEntity);
  }

  async save(personalRecord: PersonalRecord): Promise<PersonalRecord> {
    const personalRecordEntity = await this.em.findOneOrFail(
      PersonalRecordEntity,
      { id: personalRecord.id }
    );
    this.assignPersonalRecord(personalRecordEntity, personalRecord);

    await this.em.persistAndFlush(personalRecordEntity);

    const savedPersonalRecordEntity = await this.findPersonalRecordById(
      personalRecordEntity.id
    );

    if (!savedPersonalRecordEntity) {
      throw new Error('Personal record not found after save');
    }

    return toPersonalRecordDomain(savedPersonalRecordEntity);
  }

  private assignPersonalRecord(
    personalRecordEntity: PersonalRecordEntity,
    personalRecord: PersonalRecord
  ): void {
    personalRecordEntity.weight = personalRecord.weight;
    personalRecordEntity.date = personalRecord.date;
    personalRecordEntity.athlete = this.em.getReference(
      AthleteEntity,
      personalRecord.athleteId
    );
    personalRecordEntity.exercise = this.em.getReference(
      Exercise,
      personalRecord.exercise.id
    );
  }

  async remove(personalRecord: PersonalRecord): Promise<void> {
    const personalRecordEntity = this.em.getReference(
      PersonalRecordEntity,
      personalRecord.id
    );

    await this.em.removeAndFlush(personalRecordEntity);
  }

  private async findPersonalRecordById(
    id: PersonalRecordId | string
  ): Promise<PersonalRecordEntity | null> {
    return await this.em.findOne(
      PersonalRecordEntity,
      { id },
      {
        populate: ['athlete', 'exercise'],
      }
    );
  }
}
