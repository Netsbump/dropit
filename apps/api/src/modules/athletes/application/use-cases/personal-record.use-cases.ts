import {
  CreatePersonalRecord,
  PersonalRecordsSummary,
  UpdatePersonalRecord,
} from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PersonalRecord } from '../../domain/personal-record.entity';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { PersonalRecordMapper } from '../../interface/mappers/personal-record.mapper';
import { PersonalRecordPresenter } from '../../interface/presenter/personal-record.presenter';
import { IPersonalRecordRepository, PERSONAL_RECORD_REPO } from '../../application/ports/personal-record.repository';
import { IAthleteRepository, ATHLETE_REPO } from '../ports/athlete.repository';
import { Inject } from '@nestjs/common';
import { ExerciseService } from '../../../training/exercise/exercise.service'
import { Exercise } from '../../../training/exercise/exercise.entity';

@Injectable()
export class PersonalRecordUseCases {
  constructor(
    private readonly organizationService: OrganizationService,
    @Inject(PERSONAL_RECORD_REPO)
    private readonly personalRecordRepository: IPersonalRecordRepository,
    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    private readonly exerciseService: ExerciseService,
  ) {}

  async getAll(currentUserId: string, organizationId: string) {
    try {
      // 1. Check if user is coach or athlete
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      
      let personalRecords: PersonalRecord[];

      if (isUserCoach) {
        // 2a. If user is coach, get all personal records in the organization
        const athleteUserIds = await this.organizationService.getAthleteUserIds(organizationId);

        if (athleteUserIds.length === 0) {
          throw new NotFoundException('No athletes found in the organization');
        }

        personalRecords = await this.personalRecordRepository.getAll(athleteUserIds);

        if (!personalRecords || personalRecords.length === 0) {
          throw new NotFoundException('No personal records found');
        }
      } else {
        // 2b. If user is athlete, get only their own personal records
        const athlete = await this.athleteRepository.getOne(currentUserId);
        if (!athlete) {
          throw new NotFoundException('Athlete not found');
        }

        personalRecords = await this.personalRecordRepository.getAllByAthleteId(currentUserId);

        if (!personalRecords || personalRecords.length === 0) {
          return PersonalRecordPresenter.present([]);
        }
      }

      // 3. Map to DTO
      const personalRecordsDto = PersonalRecordMapper.toDtoList(personalRecords);

      // 4. Present personal records
      return PersonalRecordPresenter.present(personalRecordsDto);
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }

  async getOne(id: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get personal record
      const personalRecord = await this.personalRecordRepository.getOne(id);

      if (!personalRecord) {
        throw new NotFoundException(`Personal record with ID ${id} not found`);
      }

      // 2. Get athlete to verify it exists and get its userId
      const athlete = await this.athleteRepository.getOne(personalRecord.athlete.id);

      if (!athlete || !athlete.user) {
        throw new NotFoundException('Athlete not found');
      }

      // 3. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
        );
      }

      // 4. Map to DTO
      const personalRecordDto = PersonalRecordMapper.toDto(personalRecord);

      // 5. Present personal record
      return PersonalRecordPresenter.presentOne(personalRecordDto);
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }

  async getAllByAthleteId(athleteId: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get athlete to verify it exists
      const athlete = await this.athleteRepository.getOne(athleteId);

      if (!athlete || !athlete.user) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }

      // 2. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
        );
      }

      // 3. Get personal records for the athlete
      const personalRecords = await this.personalRecordRepository.getAllByAthleteId(athleteId);

      if (!personalRecords || personalRecords.length === 0) {
        return PersonalRecordPresenter.present([]);
      }

      // 4. Map to DTO
      const personalRecordsDto = PersonalRecordMapper.toDtoList(personalRecords);

      // 5. Present personal records
      return PersonalRecordPresenter.present(personalRecordsDto);
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }

  async getAllPersonalRecordsSummaryByAthleteId(athleteId: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get athlete to verify it exists
      const athlete = await this.athleteRepository.getOne(athleteId);

      if (!athlete || !athlete.user) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }

      // 2. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own personal records or the personal records of an athlete you are coaching"
        );
      }

      // 3. Get all personal records for the athlete
      const personalRecords = await this.personalRecordRepository.getAllByAthleteId(athleteId);

      // 4. Initialize summary object
      const summary: PersonalRecordsSummary = {};

      if (personalRecords.length === 0) {
        return PersonalRecordPresenter.presentSummary(summary);
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

      // 8. Present summary
      return PersonalRecordPresenter.presentSummary(summary);
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }

  async create(
    data: CreatePersonalRecord,
    currentUserId: string,
    organizationId: string
  ) {
    try {
      // 1. Validate user access - only coaches can create personal records
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach) {
        throw new NotFoundException(
          "Access denied. Only coaches can create personal records"
        );
      }

      // 2. Verify athlete belongs to organization
      await this.organizationService.checkAthleteBelongsToOrganization(data.athleteId, organizationId);

      // 3. Get athlete to verify it exists
      const athlete = await this.athleteRepository.getOne(data.athleteId);
      if (!athlete) {
        throw new NotFoundException(
          `Athlete with ID ${data.athleteId} not found`
        );
      }

      // 4. Create personal record entity
      const personalRecord = new PersonalRecord();
      personalRecord.weight = data.weight;
      personalRecord.date = data.date || new Date();
      personalRecord.athlete = athlete;
      
      // 5. Get exercise and set it
      const exercise = await this.exerciseService.getExercise(data.exerciseId, organizationId);
      if (!exercise) {
        throw new NotFoundException(
          `Exercise with ID ${data.exerciseId} not found`
        );
      }
      personalRecord.exercise = exercise as Exercise;

      // 6. Save personal record
      await this.personalRecordRepository.save(personalRecord);

      // 7. Get created personal record with populated relations
      const createdPersonalRecord = await this.personalRecordRepository.getOne(personalRecord.id);
      if (!createdPersonalRecord) {
        throw new NotFoundException('Personal record not found after creation');
      }

      // 8. Map to DTO
      const personalRecordDto = PersonalRecordMapper.toDto(createdPersonalRecord);

      // 9. Present personal record
      return PersonalRecordPresenter.presentCreated(personalRecordDto);
    } catch (error) {
      return PersonalRecordPresenter.presentCreationError(error as Error);
    }
  }

  async update(
    id: string,
    data: UpdatePersonalRecord,
    currentUserId: string,
    organizationId: string
  ) {
    try {
      // 1. Validate user access - only coaches can update personal records
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach) {
        throw new NotFoundException(
          "Access denied. Only coaches can update personal records"
        );
      }

      // 2. Get personal record to update
      const personalRecord = await this.personalRecordRepository.getOne(id);
      if (!personalRecord) {
        throw new NotFoundException(`Personal record with ID ${id} not found`);
      }

      // 3. Verify athlete still belongs to organization
      await this.organizationService.checkAthleteBelongsToOrganization(personalRecord.athlete.id, organizationId);

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
        throw new NotFoundException('Personal record not found after update');
      }

      // 7. Map to DTO
      const personalRecordDto = PersonalRecordMapper.toDto(updatedPersonalRecord);

      // 8. Present personal record
      return PersonalRecordPresenter.presentOne(personalRecordDto);
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }

  async delete(id: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Validate user access - only coaches can delete personal records
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach) {
        throw new NotFoundException(
          "Access denied. Only coaches can delete personal records"
        );
      }

      // 2. Get personal record to delete
      const personalRecord = await this.personalRecordRepository.getOne(id);
      if (!personalRecord) {
        throw new NotFoundException(`Personal record with ID ${id} not found`);
      }

      // 3. Verify athlete belongs to organization
      await this.organizationService.checkAthleteBelongsToOrganization(personalRecord.athlete.id, organizationId);

      // 4. Delete personal record
      await this.personalRecordRepository.remove(personalRecord);

      // 5. Present success
      return PersonalRecordPresenter.presentDeleted();
    } catch (error) {
      return PersonalRecordPresenter.presentError(error as Error);
    }
  }
}
