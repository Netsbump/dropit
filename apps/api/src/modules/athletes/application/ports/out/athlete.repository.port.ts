import type { UserId } from '../../../../../shared/kernel/identity';
import type { SearchablePaginationQuery } from '../../../../../shared/kernel/pagination';
import { Athlete } from '../../../domain/athlete';
import type { AthleteId } from '../../../domain/athlete-id';
import type {
  AthleteDetailsReadModel,
  PaginatedAthleteDetailsReadModel,
} from '../../models/athlete-details.read-model';

export const ATHLETE_REPO = Symbol('ATHLETE_REPO');
export const ATHLETE_READ_REPO = Symbol('ATHLETE_READ_REPO');

export interface IAthleteRepository {
  findById(athleteId: AthleteId): Promise<Athlete | null>;
  findByUserId(userId: UserId): Promise<Athlete | null>;
  listByIds(athleteIds: string[]): Promise<Athlete[]>;
  listByUserIds(athleteUserIds: UserId[]): Promise<Athlete[]>;
  add(athlete: Athlete): Promise<Athlete>;
  save(athlete: Athlete): Promise<Athlete>;
  remove(athlete: Athlete): Promise<void>;
}

export interface IAthleteReadRepository {
  findDetailsByUserId(
    athleteUserId: UserId
  ): Promise<AthleteDetailsReadModel | null>;
  listDetailsByUserIds(
    athleteUserIds: UserId[],
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel>;
}
