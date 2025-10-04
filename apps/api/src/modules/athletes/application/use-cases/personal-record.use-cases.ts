import {
  CreatePersonalRecord,
  PersonalRecordsSummary,
  UpdatePersonalRecord,
} from '@dropit/schemas';
import { PersonalRecord } from '../../domain/personal-record.entity';
import { IPersonalRecordRepository } from '../ports/personal-record.repository.port';
import { IAthleteRepository } from '../ports/athlete.repository.port';
import { Exercise } from '../../../training/domain/exercise.entity';
import { IExerciseRepository } from '../../../training/application/ports/exercise.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { IPersonalRecordUseCases } from '../ports/personal-record-use-cases.port';
import {
  PersonalRecordNotFoundException,
  PersonalRecordAccessDeniedException,
  AthleteNotFoundException,
  ExerciseNotFoundException,
  NoAthletesFoundException,
  NoPersonalRecordsFoundException,
} from '../exceptions/personal-record.exceptions';

/**
 * Personal Record Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of personal record business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class PersonalRecordUseCases implements IPersonalRecordUseCases {
  constructor(
    private readonly personalRecordRepository: IPersonalRecordRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly exerciseRepository: IExerciseRepository,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getAll(currentUserId: string, organizationId: string): Promise<PersonalRecord[]> {
    // 1. Check if user is coach or athlete
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);

    let personalRecords: PersonalRecord[];

    if (isUserCoach) {
      // 2a. If user is coach, get all personal records in the organization
      const athleteUserIds = await this.memberUseCases.getAthleteUserIds(organizationId);

      if (athleteUserIds.length === 0) {
        throw new NoAthletesFoundException('No athletes found in the organization');
      }

      personalRecords = await this.personalRecordRepository.getAll(athleteUserIds);

      if (!personalRecords || personalRecords.length === 0) {
        throw new NoPersonalRecordsFoundException('No personal records found');
      }
    } else {
      // 2b. If user is athlete, get only their own personal records
      const athlete = await this.athleteRepository.getOne(currentUserId);
      if (!athlete) {
        throw new AthleteNotFoundException('Athlete not found');
      }

      personalRecords = await this.personalRecordRepository.getAllByAthleteId(currentUserId);

      if (!personalRecords || personalRecords.length === 0) {
        return [];
      }
    }

    return personalRecords;
  }

  async getOne(id: string, currentUserId: string, organizationId: string): Promise<PersonalRecord> {
    // 1. Get personal record
    const personalRecord = await this.personalRecordRepository.getOne(id);

    if (!personalRecord) {
      throw new PersonalRecordNotFoundException(`Personal record with ID ${id} not found`);
    }

    // 2. Get athlete to verify it exists and get its userId
    const athlete = await this.athleteRepository.getOne(personalRecord.athlete.id);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException('Athlete not found');
    }

    // 3. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
      );
    }

    return personalRecord;
  }

  async getAllByAthleteId(athleteId: string, currentUserId: string, organizationId: string): Promise<PersonalRecord[]> {
    // 1. Get athlete to verify it exists
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // 2. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
      );
    }

    // 3. Get personal records for the athlete
    const personalRecords = await this.personalRecordRepository.getAllByAthleteId(athleteId);

    if (!personalRecords || personalRecords.length === 0) {
      return [];
    }

    return personalRecords;
  }

  async getAllPersonalRecordsSummaryByAthleteId(athleteId: string, currentUserId: string, organizationId: string): Promise<PersonalRecordsSummary> {
    // 1. Get athlete to verify it exists
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // 2. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
      );
    }

    // 3. Get all personal records for the athlete
    const personalRecords = await this.personalRecordRepository.getAllByAthleteId(athleteId);

    // 4. Initialize summary object
    const summary: PersonalRecordsSummary = {};

    if (personalRecords.length === 0) {
      return summary;
    }

    // 5. Find snatch and clean_and_jerk records
    const snatchRecords = personalRecords.filter((record: PersonalRecord) =>
      record.exercise.name.toLowerCase().includes('snatch')
    );
    const cleanAndJerkRecords = personalRecords.filter((record: PersonalRecord) =>
      record.exercise.name.toLowerCase().includes('clean and jerk')
    );

    // 6. Get max values
    if (snatchRecords.length > 0) {
      summary.snatch = Math.max(...snatchRecords.map((r: PersonalRecord) => r.weight));
    }

    if (cleanAndJerkRecords.length > 0) {
      summary.cleanAndJerk = Math.max(
        ...cleanAndJerkRecords.map((r: PersonalRecord) => r.weight)
      );
    }

    // 7. Calculate total if both snatch and cleanAndJerk are present
    if (summary.snatch && summary.cleanAndJerk) {
      summary.total = summary.snatch + summary.cleanAndJerk;
    }

    return summary;
  }

  async create(
    data: CreatePersonalRecord,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord> {
    // 1. Validate user access - only coaches can create personal records
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. Only coaches can create personal records"
      );
    }

    // 2. Verify athlete belongs to organization
    await this.memberUseCases.isUserAthleteInOrganization(data.athleteId, organizationId);

    // 3. Get athlete to verify it exists
    const athlete = await this.athleteRepository.getOne(data.athleteId);
    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${data.athleteId} not found`
      );
    }

    // 4. Create personal record entity
    const personalRecord = new PersonalRecord();
    personalRecord.weight = data.weight;
    personalRecord.date = data.date || new Date();
    personalRecord.athlete = athlete;

    // 4. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 5. Get exercise and set it
    const exercise = await this.exerciseRepository.getOne(data.exerciseId, coachFilterConditions);
    if (!exercise) {
      throw new ExerciseNotFoundException(
        `Exercise with ID ${data.exerciseId} not found`
      );
    }
    personalRecord.exercise = exercise as Exercise;

    // 6. Save personal record
    await this.personalRecordRepository.save(personalRecord);

    // 7. Get created personal record with populated relations
    const createdPersonalRecord = await this.personalRecordRepository.getOne(personalRecord.id);
    if (!createdPersonalRecord) {
      throw new PersonalRecordNotFoundException('Personal record not found after creation');
    }

    return createdPersonalRecord;
  }

  async update(
    id: string,
    data: UpdatePersonalRecord,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord> {
    // 1. Validate user access - only coaches can update personal records
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. Only coaches can update personal records"
      );
    }

    // 2. Get personal record to update
    const personalRecord = await this.personalRecordRepository.getOne(id);
    if (!personalRecord) {
      throw new PersonalRecordNotFoundException(`Personal record with ID ${id} not found`);
    }

    // 3. Verify athlete still belongs to organization
    await this.memberUseCases.isUserAthleteInOrganization(personalRecord.athlete.id, organizationId);

    // 4. Update personal record fields
    if (data.weight !== undefined) {
      personalRecord.weight = data.weight;
    }
    if (data.date) {
      personalRecord.date = data.date;
    }

    // 5. Save updated personal record
    await this.personalRecordRepository.save(personalRecord);

    // 6. Get updated personal record with populated relations
    const updatedPersonalRecord = await this.personalRecordRepository.getOne(id);
    if (!updatedPersonalRecord) {
      throw new PersonalRecordNotFoundException('Personal record not found after update');
    }

    return updatedPersonalRecord;
  }

  async delete(id: string, currentUserId: string, organizationId: string): Promise<void> {
    // 1. Validate user access - only coaches can delete personal records
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach) {
      throw new PersonalRecordAccessDeniedException(
        "Access denied. Only coaches can delete personal records"
      );
    }

    // 2. Get personal record to delete
    const personalRecord = await this.personalRecordRepository.getOne(id);
    if (!personalRecord) {
      throw new PersonalRecordNotFoundException(`Personal record with ID ${id} not found`);
    }

    // 3. Verify athlete belongs to organization
    await this.memberUseCases.isUserAthleteInOrganization(personalRecord.athlete.id, organizationId);

    // 4. Delete personal record
    await this.personalRecordRepository.remove(personalRecord);
  }
}
