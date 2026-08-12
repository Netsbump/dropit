import {
  CreatePersonalRecordInput,
  PersonalRecordsSummary,
  UpdatePersonalRecordInput,
} from '@dropit/schemas';
import { PersonalRecord } from '../domain/personal-record';
import type { Athlete } from '../domain/athlete';
import { IPersonalRecordRepository } from './ports/personal-record.repository.port';
import { IAthleteRepository } from './ports/athlete.repository.port';
import { IExerciseRepository } from '../../training/application/ports/exercise.repository.port';
import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import { IAthletePersonalRecords } from './ports/athlete-personal-records.port';
import {
  PersonalRecordNotFoundException,
  PersonalRecordAccessDeniedException,
  AthleteNotFoundException,
  ExerciseNotFoundException,
  NoAthletesFoundException,
  NoPersonalRecordsFoundException,
} from './errors/personal-record.exceptions';

/**
 * Athlete Personal Records
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class AthletePersonalRecords implements IAthletePersonalRecords {
  constructor(
    private readonly personalRecordRepository: IPersonalRecordRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly exerciseRepository: IExerciseRepository,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  private async getAthleteOrThrow(athleteId: string): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getPersonalRecordOrThrow(id: string): Promise<PersonalRecord> {
    const personalRecord = await this.personalRecordRepository.findById(id);

    if (!personalRecord) {
      throw new PersonalRecordNotFoundException(
        `Personal record with ID ${id} not found`
      );
    }

    return personalRecord;
  }

  private async assertCanViewAthleteRecords(
    currentUserId: string,
    organizationId: string,
    athleteUserId: string
  ): Promise<void> {
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(
      currentUserId,
      organizationId
    );

    if (!isUserCoach && currentUserId !== athleteUserId) {
      throw new PersonalRecordAccessDeniedException(
        'Access denied. You can only access your own personal records or the personal records of an athlete you are coaching'
      );
    }
  }

  private async assertCanManageAthleteRecords(
    currentUserId: string,
    organizationId: string
  ): Promise<void> {
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(
      currentUserId,
      organizationId
    );

    if (!isUserCoach) {
      throw new PersonalRecordAccessDeniedException(
        'Access denied. Only coaches can manage personal records'
      );
    }
  }

  private async assertAthleteBelongsToOrganization(
    athleteUserId: string,
    organizationId: string
  ): Promise<void> {
    const isAthleteInOrganization =
      await this.memberUseCases.isUserAthleteInOrganization(
        athleteUserId,
        organizationId
      );

    if (!isAthleteInOrganization) {
      throw new PersonalRecordAccessDeniedException(
        'Access denied. Athlete does not belong to organization'
      );
    }
  }

  async findAll(
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]> {
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(
      currentUserId,
      organizationId
    );

    let personalRecords: PersonalRecord[];

    if (isUserCoach) {
      const athleteUserIds =
        await this.memberUseCases.getAthleteUserIds(organizationId);

      if (athleteUserIds.length === 0) {
        throw new NoAthletesFoundException(
          'No athletes found in the organization'
        );
      }

      personalRecords =
        await this.personalRecordRepository.listByAthleteUserIds(
          athleteUserIds
        );

      if (!personalRecords || personalRecords.length === 0) {
        throw new NoPersonalRecordsFoundException('No personal records found');
      }
    } else {
      const athlete = await this.athleteRepository.findByUserId(currentUserId);
      if (!athlete?.id) {
        throw new AthleteNotFoundException('Athlete not found');
      }

      personalRecords = await this.personalRecordRepository.listByAthleteId(
        athlete.id
      );

      if (!personalRecords || personalRecords.length === 0) {
        return [];
      }
    }

    return personalRecords;
  }

  async findOne(
    id: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord> {
    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.assertCanViewAthleteRecords(
      currentUserId,
      organizationId,
      athlete.userId
    );

    return personalRecord;
  }

  async findAllByAthleteId(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.assertCanViewAthleteRecords(
      currentUserId,
      organizationId,
      athlete.userId
    );

    const personalRecords =
      await this.personalRecordRepository.listByAthleteId(athleteId);

    if (!personalRecords || personalRecords.length === 0) {
      return [];
    }

    return personalRecords;
  }

  async findBestOlympicLiftsByAthleteId(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecordsSummary> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.assertCanViewAthleteRecords(
      currentUserId,
      organizationId,
      athlete.userId
    );

    const personalRecords =
      await this.personalRecordRepository.listByAthleteId(athleteId);
    const summary: PersonalRecordsSummary = {};

    if (personalRecords.length === 0) {
      return summary;
    }

    const snatchRecords = personalRecords.filter((record) =>
      record.exercise.name.toLowerCase().includes('snatch')
    );
    const cleanAndJerkRecords = personalRecords.filter((record) =>
      record.exercise.name.toLowerCase().includes('clean and jerk')
    );

    if (snatchRecords.length > 0) {
      summary.snatch = Math.max(...snatchRecords.map((r) => r.weight));
    }

    if (cleanAndJerkRecords.length > 0) {
      summary.cleanAndJerk = Math.max(
        ...cleanAndJerkRecords.map((r) => r.weight)
      );
    }

    if (summary.snatch && summary.cleanAndJerk) {
      summary.total = summary.snatch + summary.cleanAndJerk;
    }

    return summary;
  }

  async create(
    data: CreatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord> {
    await this.assertCanManageAthleteRecords(currentUserId, organizationId);

    const athlete = await this.getAthleteOrThrow(data.athleteId);

    await this.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    const coachFilterConditions =
      await this.memberUseCases.getCoachFilterConditions(organizationId);

    const exercise = await this.exerciseRepository.getOne(
      data.exerciseId,
      coachFilterConditions
    );
    if (!exercise) {
      throw new ExerciseNotFoundException(
        `Exercise with ID ${data.exerciseId} not found`
      );
    }

    const personalRecord = new PersonalRecord({
      athleteId: data.athleteId,
      exercise: {
        id: exercise.id,
        name: exercise.name,
      },
      weight: data.weight,
      date: data.date ?? new Date(),
    });

    return await this.personalRecordRepository.save(personalRecord);
  }

  async update(
    id: string,
    data: UpdatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord> {
    await this.assertCanManageAthleteRecords(currentUserId, organizationId);

    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    const personalRecordToUpdate = new PersonalRecord({
      id: personalRecord.id,
      athleteId: personalRecord.athleteId,
      exercise: personalRecord.exercise,
      weight: data.weight ?? personalRecord.weight,
      date: data.date ?? personalRecord.date,
    });

    return await this.personalRecordRepository.save(personalRecordToUpdate);
  }

  async delete(
    id: string,
    currentUserId: string,
    organizationId: string
  ): Promise<void> {
    await this.assertCanManageAthleteRecords(currentUserId, organizationId);

    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.personalRecordRepository.remove(personalRecord);
  }
}
