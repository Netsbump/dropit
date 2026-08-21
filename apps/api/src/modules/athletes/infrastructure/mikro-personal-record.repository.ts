import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import { PersonalRecordEntity } from '../../database/entities/personal-record.entity';
import { Exercise } from '../../training/domain/exercise.entity';
import type { IPersonalRecordRepository } from '../application/ports/out/personal-record.repository.port';
import type { PersonalRecord } from '../domain/personal-record';
import type { AthleteId } from '../domain/athlete-id';
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

  async save(personalRecord: PersonalRecord): Promise<PersonalRecord> {
    const personalRecordEntity = personalRecord.id
      ? await this.em.findOneOrFail(PersonalRecordEntity, {
          id: personalRecord.id,
        })
      : new PersonalRecordEntity();

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

    await this.em.persistAndFlush(personalRecordEntity);

    const savedPersonalRecordEntity = await this.findPersonalRecordById(
      personalRecordEntity.id
    );

    if (!savedPersonalRecordEntity) {
      throw new Error('Personal record not found after save');
    }

    return toPersonalRecordDomain(savedPersonalRecordEntity);
  }

  async remove(personalRecord: PersonalRecord): Promise<void> {
    if (!personalRecord.id) {
      throw new Error('Cannot remove personal record without id');
    }

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
