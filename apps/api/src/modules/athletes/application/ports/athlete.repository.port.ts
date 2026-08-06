import { Athlete } from '../../domain/athlete';

export const ATHLETE_REPO = Symbol('ATHLETE_REPO');

export type AthleteDetails = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | null;
  country: string | null;
  email: string;
  image: string;
  weight: number;
  level: string;
  sex_category: string;
  weight_category: string;
  pr_snatch?: number;
  pr_cleanAndJerk?: number;
};

export interface IAthleteRepository {
  findOneWithDetails(athleteId: string): Promise<AthleteDetails | null>;
  findAllWithDetails(athleteUserIds: string[]): Promise<AthleteDetails[]>;
  getOne(athleteId: string): Promise<Athlete | null>;
  getAll(athleteUserIds: string[]): Promise<Athlete[]>;
  findByUserId(userId: string): Promise<Athlete | null>;
  save(athlete: Athlete): Promise<Athlete>;
  remove(athlete: Athlete): Promise<void>;
}
