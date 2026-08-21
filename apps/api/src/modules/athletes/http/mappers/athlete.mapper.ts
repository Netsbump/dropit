import type {
  AthleteDetailsDto,
  AthleteDto,
  CreateAthleteInput,
  UpdateAthleteInput,
} from '@dropit/schemas';
import type { AthleteCreation, AthleteUpdate } from '../../domain/athlete';
import type { AthleteDetailsReadModel } from '../../application/read-models/athlete-details.read-model';
import { Athlete } from '../../domain/athlete';

export const toAthleteCreation = (
  input: CreateAthleteInput,
  userId: string
): AthleteCreation => ({
  userId,
  firstName: input.firstName,
  lastName: input.lastName,
  birthday: input.birthday ? new Date(input.birthday) : null,
  country: input.country ?? null,
});

export const toAthleteUpdate = (input: UpdateAthleteInput): AthleteUpdate => ({
  firstName: input.firstName,
  lastName: input.lastName,
  birthday: input.birthday !== undefined ? new Date(input.birthday) : undefined,
  country: input.country,
});

export const toAthleteDetailsDto = (
  athlete: AthleteDetailsReadModel
): AthleteDetailsDto => ({
  id: athlete.id,
  firstName: athlete.firstName,
  lastName: athlete.lastName,
  birthday: athlete.birthday ? new Date(athlete.birthday) : undefined,
  email: athlete.email ?? '',
  image: athlete.image ?? '',
  country: athlete.country ?? undefined,
  metrics:
    athlete.currentWeight !== null
      ? { weight: athlete.currentWeight }
      : undefined,
  personalRecords:
    athlete.personalRecords.snatch !== null ||
    athlete.personalRecords.cleanAndJerk !== null
      ? {
          snatch: athlete.personalRecords.snatch ?? undefined,
          cleanAndJerk: athlete.personalRecords.cleanAndJerk ?? undefined,
        }
      : undefined,
  competitorStatus: athlete.competitorStatus
    ? {
        level: athlete.competitorStatus.level,
        sexCategory: athlete.competitorStatus.sexCategory,
        weightCategory: athlete.competitorStatus.weightCategory ?? undefined,
      }
    : undefined,
});

export const toAthleteDetailsDtoList = (
  athletes: AthleteDetailsReadModel[]
): AthleteDetailsDto[] => athletes.map(toAthleteDetailsDto);

export const toAthleteDto = (athlete: Athlete): AthleteDto => {
  if (!athlete.id) {
    throw new Error('Athlete id is required to map AthleteDto');
  }

  return {
    id: athlete.id.value,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    birthday: athlete.birthday ? new Date(athlete.birthday) : undefined,
    userId: athlete.userId,
  };
};

export const toAthleteDtoList = (athletes: Athlete[]): AthleteDto[] =>
  athletes.map(toAthleteDto);
