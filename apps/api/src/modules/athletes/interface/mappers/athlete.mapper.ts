import type {
  AthleteDetailsDto,
  AthleteDto,
  CreateAthleteInput,
  UpdateAthleteInput,
} from '@dropit/schemas';
import type { AthleteCreation, AthleteUpdate } from '../../domain/athlete';
import type { AthleteDetails } from '../../application/ports/athlete.repository.port';
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

export const toAthleteUpdate = (
  input: UpdateAthleteInput
): AthleteUpdate => ({
  firstName: input.firstName,
  lastName: input.lastName,
  birthday: input.birthday !== undefined ? new Date(input.birthday) : undefined,
  country: input.country,
});

export const toAthleteDetailsDto = (
  athlete: AthleteDetails
): AthleteDetailsDto => ({
  id: athlete.id,
  firstName: athlete.firstName,
  lastName: athlete.lastName,
  birthday: athlete.birthday ? new Date(athlete.birthday) : undefined,
  email: athlete.email ?? '',
  image: athlete.image ?? '',
  country: athlete.country ?? undefined,
  metrics: athlete.weight ? { weight: athlete.weight } : undefined,
  personalRecords:
    athlete.pr_snatch || athlete.pr_cleanAndJerk
      ? {
          snatch: athlete.pr_snatch,
          cleanAndJerk: athlete.pr_cleanAndJerk,
        }
      : undefined,
  competitorStatus:
    athlete.level || athlete.sex_category || athlete.weight_category
      ? {
          level: athlete.level ?? '',
          sexCategory: athlete.sex_category ?? '',
          weightCategory: athlete.weight_category
            ? parseInt(athlete.weight_category)
            : undefined,
        }
      : undefined,
});

export const toAthleteDetailsDtoList = (
  athletes: AthleteDetails[]
): AthleteDetailsDto[] => athletes.map(toAthleteDetailsDto);

export const toAthleteDto = (athlete: Athlete): AthleteDto => {
  if (!athlete.id) {
    throw new Error('Athlete id is required to map AthleteDto');
  }

  return {
    id: athlete.id,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    birthday: athlete.birthday ? new Date(athlete.birthday) : undefined,
    userId: athlete.userId,
  };
};

export const toAthleteDtoList = (athletes: Athlete[]): AthleteDto[] =>
  athletes.map(toAthleteDto);
