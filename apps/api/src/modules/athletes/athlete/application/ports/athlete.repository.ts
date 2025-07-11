import { Athlete } from "../../domain/athlete.entity";

export const ATHLETE_REPO = Symbol('ATHLETE_REPO');

export type AthleteBasics = Pick<
  Athlete,
  'id' | 'firstName' | 'lastName' | 'birthday' | 'country'
>;

export type AthleteDetails = AthleteBasics & {
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
  save(athlete: Athlete): Promise<void>;
  remove(athlete: Athlete): Promise<void>;
}