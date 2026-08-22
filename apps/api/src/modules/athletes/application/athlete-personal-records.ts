import {
  CreatePersonalRecordInput,
  PersonalRecordsSummary,
  UpdatePersonalRecordInput,
} from '@dropit/schemas';
import {
  PersonalRecord,
  PersonalRecordDomainError,
} from '../domain/personal-record';
import type { Athlete } from '../domain/athlete';
import { parseAthleteId, type AthleteId } from '../domain/athlete-id';
import type { PersonalRecordId } from '../domain/personal-record-id';
import type {
  OrganizationId,
  UserId,
} from '../../../shared/kernel/identity';
import { IPersonalRecordRepository } from './ports/out/personal-record.repository.port';
import { IAthleteRepository } from './ports/out/athlete.repository.port';
import { IExerciseCatalog } from './ports/out/exercise-catalog.port';
import { IAthletePersonalRecords } from './ports/in/athlete-personal-records.port';
import { IAthleteAccessPolicy } from './policies/athlete-access-policy.interface';
import { IOrganizationMembership } from './ports/out/organization-membership.port';
import {
  PersonalRecordNotFoundException,
  AthleteNotFoundException,
  ExerciseNotFoundException,
  InvalidPersonalRecordException,
  NoAthletesFoundException,
  NoPersonalRecordsFoundException,
} from './errors/personal-record.exceptions';

export class AthletePersonalRecords implements IAthletePersonalRecords {
  constructor(
    private readonly personalRecordRepository: IPersonalRecordRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly exerciseCatalog: IExerciseCatalog,
    private readonly organizationMembership: IOrganizationMembership,
    private readonly athleteAccessPolicy: IAthleteAccessPolicy
  ) {}

  private async getAthleteOrThrow(athleteId: AthleteId): Promise<Athlete> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new AthleteNotFoundException(
        `Athlete with ID ${athleteId} not found`
      );
    }

    return athlete;
  }

  private async getPersonalRecordOrThrow(
    id: PersonalRecordId
  ): Promise<PersonalRecord> {
    const personalRecord = await this.personalRecordRepository.findById(id);

    if (!personalRecord) {
      throw new PersonalRecordNotFoundException(
        `Personal record with ID ${id} not found`
      );
    }

    return personalRecord;
  }

  async listAccessible(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord[]> {
    const isUserCoach = await this.organizationMembership.isCoach(
      currentUserId,
      organizationId
    );

    let personalRecords: PersonalRecord[];

    if (isUserCoach) {
      const athleteUserIds =
        await this.organizationMembership.listAthleteUserIds(organizationId);

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

  async findById(
    id: PersonalRecordId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord> {
    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    return personalRecord;
  }

  async listByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord[]> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

    const personalRecords =
      await this.personalRecordRepository.listByAthleteId(athleteId);

    if (!personalRecords || personalRecords.length === 0) {
      return [];
    }

    return personalRecords;
  }

  async findBestOlympicLiftsByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecordsSummary> {
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertCanViewAthlete({
      currentUserId,
      organizationId,
      athleteUserId: athlete.userId,
    });

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

  async record(
    data: CreatePersonalRecordInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const athleteId = parseAthleteId(data.athleteId);
    const athlete = await this.getAthleteOrThrow(athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    const exercise = await this.exerciseCatalog.findExerciseByOrganization(
      data.exerciseId,
      organizationId
    );
    if (!exercise) {
      throw new ExerciseNotFoundException(
        `Exercise with ID ${data.exerciseId} not found`
      );
    }

    let personalRecord: PersonalRecord;

    try {
      personalRecord = new PersonalRecord({
        athleteId,
        exercise: {
          id: exercise.id,
          name: exercise.name,
        },
        weight: data.weight,
        date: data.date ?? new Date(),
      });
    } catch (error) {
      if (error instanceof PersonalRecordDomainError) {
        throw new InvalidPersonalRecordException(error.message);
      }

      throw error;
    }

    return await this.personalRecordRepository.save(personalRecord);
  }

  async amend(
    id: PersonalRecordId,
    data: UpdatePersonalRecordInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    let personalRecordToUpdate: PersonalRecord;

    try {
      personalRecordToUpdate = personalRecord.amend(data);
    } catch (error) {
      if (error instanceof PersonalRecordDomainError) {
        throw new InvalidPersonalRecordException(error.message);
      }

      throw error;
    }

    return await this.personalRecordRepository.save(personalRecordToUpdate);
  }

  async remove(
    id: PersonalRecordId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void> {
    await this.athleteAccessPolicy.assertCanManageAthleteData(
      currentUserId,
      organizationId
    );

    const personalRecord = await this.getPersonalRecordOrThrow(id);
    const athlete = await this.getAthleteOrThrow(personalRecord.athleteId);

    await this.athleteAccessPolicy.assertAthleteBelongsToOrganization(
      athlete.userId,
      organizationId
    );

    await this.personalRecordRepository.remove(personalRecord);
  }
}
