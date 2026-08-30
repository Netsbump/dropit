import type { PaginatedResult } from '../../../../shared/kernel/pagination';

export type AthleteDetailsReadModel = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | null;
  country: string | null;
  email: string;
  image: string;
  currentWeight: number | null;
  competitorStatus: {
    level: string;
    sexCategory: string;
    weightCategory: number | null;
  } | null;
  personalRecords: {
    snatch: number | null;
    cleanAndJerk: number | null;
  };
};

export type PaginatedAthleteDetailsReadModel =
  PaginatedResult<AthleteDetailsReadModel>;
