import {
  CreatePersonalRecord,
  PersonalRecordDto,
  PersonalRecordsSummary,
  UpdatePersonalRecord,
} from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { wrap } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { Exercise } from '../../training/exercise/exercise.entity';
import { PersonalRecord } from './personal-record.entity';

@Injectable()
export class PersonalRecordService {
  constructor(private readonly em: EntityManager) {}

  async getPersonalRecords(): Promise<PersonalRecordDto[]> {
    const personalRecords = await this.em.findAll(PersonalRecord, {
      populate: ['athlete', 'exercise'],
    });

    if (!personalRecords || personalRecords.length === 0) {
      return [];
    }

    return personalRecords.map(this.mapToDto);
  }

  async getPersonalRecord(id: string): Promise<PersonalRecordDto> {
    const personalRecord = await this.em.findOne(
      PersonalRecord,
      { id },
      {
        populate: ['athlete', 'exercise'],
      }
    );

    if (!personalRecord) {
      throw new NotFoundException(`Personal record with ID ${id} not found`);
    }

    return this.mapToDto(personalRecord);
  }

  async getAthletePersonalRecords(
    athleteId: string
  ): Promise<PersonalRecordDto[]> {
    const athlete = await this.em.findOne(Athlete, { id: athleteId });

    if (!athlete) {
      throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    const personalRecords = await this.em.find(
      PersonalRecord,
      { athlete: athleteId },
      {
        populate: ['exercise'],
      }
    );

    if (!personalRecords || personalRecords.length === 0) {
      return [];
    }

    return personalRecords.map(this.mapToDto);
  }

  async getAthletePersonalRecordsSummary(
    athleteId: string
  ): Promise<PersonalRecordsSummary> {
    const athlete = await this.em.findOne(Athlete, { id: athleteId });

    if (!athlete) {
      throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // Get all personal records for the athlete
    const personalRecords = await this.em.find(
      PersonalRecord,
      { athlete: athleteId },
      {
        populate: ['exercise'],
      }
    );

    // Initialize summary object
    const summary: PersonalRecordsSummary = {};

    if (personalRecords.length === 0) {
      return summary;
    }

    // Find snatch and clean_and_jerk records
    const snatchRecords = personalRecords.filter((record) =>
      record.exercise.name.toLowerCase().includes('snatch')
    );
    const cleanAndJerkRecords = personalRecords.filter((record) =>
      record.exercise.name.toLowerCase().includes('clean and jerk')
    );

    // Get max values
    if (snatchRecords.length > 0) {
      summary.snatch = Math.max(...snatchRecords.map((r) => r.weight));
    }

    if (cleanAndJerkRecords.length > 0) {
      summary.cleanAndJerk = Math.max(
        ...cleanAndJerkRecords.map((r) => r.weight)
      );
    }

    // Calculate total if both snatch and cleanAndJerk are present
    if (summary.snatch && summary.cleanAndJerk) {
      summary.total = summary.snatch + summary.cleanAndJerk;
    }

    return summary;
  }

  async createPersonalRecord(
    data: CreatePersonalRecord
  ): Promise<PersonalRecordDto> {
    const athlete = await this.em.findOne(Athlete, {
      id: data.athleteId,
    });

    if (!athlete) {
      throw new NotFoundException(
        `Athlete with ID ${data.athleteId} not found`
      );
    }

    const exercise = await this.em.findOne(Exercise, {
      id: data.exerciseId,
    });

    if (!exercise) {
      throw new NotFoundException(
        `Exercise with ID ${data.exerciseId} not found`
      );
    }

    const personalRecord = new PersonalRecord();
    personalRecord.weight = data.weight;
    personalRecord.date = data.date || new Date();
    personalRecord.athlete = athlete;
    personalRecord.exercise = exercise;

    await this.em.persistAndFlush(personalRecord);

    return this.getPersonalRecord(personalRecord.id);
  }

  async updatePersonalRecord(
    id: string,
    data: UpdatePersonalRecord
  ): Promise<PersonalRecordDto> {
    const personalRecord = await this.em.findOne(PersonalRecord, { id });

    if (!personalRecord) {
      throw new NotFoundException(`Personal record with ID ${id} not found`);
    }

    const updateData: Partial<{
      weight: number;
      date: Date;
    }> = {};

    if (data.weight !== undefined) {
      updateData.weight = data.weight;
    }

    if (data.date) {
      updateData.date = data.date;
    }

    wrap(personalRecord).assign(updateData, {
      mergeObjectProperties: true,
    });

    await this.em.persistAndFlush(personalRecord);

    return this.getPersonalRecord(personalRecord.id);
  }

  async deletePersonalRecord(id: string): Promise<void> {
    const personalRecord = await this.em.findOne(PersonalRecord, { id });

    if (!personalRecord) {
      throw new NotFoundException(`Personal record with ID ${id} not found`);
    }

    await this.em.removeAndFlush(personalRecord);
  }

  private mapToDto(record: PersonalRecord): PersonalRecordDto {
    return {
      id: record.id,
      weight: record.weight,
      date: record.date,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      athleteId: record.athlete.id,
      exerciseId: record.exercise.id,
      exerciseName: record.exercise.name,
    };
  }
}
