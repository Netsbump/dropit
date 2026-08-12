import { Athlete } from '../../../domain/athlete';
import type { AthleteDetailsReadModel } from '../../read-models/athlete-details.read-model';

export const ATHLETE_REPO = Symbol('ATHLETE_REPO');
export const ATHLETE_READ_REPO = Symbol('ATHLETE_READ_REPO');

export interface IAthleteRepository {
  findById(athleteId: string): Promise<Athlete | null>;
  findByUserId(userId: string): Promise<Athlete | null>;
  listByIds(athleteIds: string[]): Promise<Athlete[]>;
  listByUserIds(athleteUserIds: string[]): Promise<Athlete[]>;
  save(athlete: Athlete): Promise<Athlete>;
  remove(athlete: Athlete): Promise<void>;
}

export interface IAthleteReadRepository {
  findDetailsByUserId(
    athleteUserId: string
  ): Promise<AthleteDetailsReadModel | null>;
  listDetailsByUserIds(
    athleteUserIds: string[]
  ): Promise<AthleteDetailsReadModel[]>;
}
