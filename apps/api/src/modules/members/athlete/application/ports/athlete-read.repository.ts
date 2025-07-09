import { Athlete } from "../../domain/athlete.entity";

export const ATHLETE_READ_REPO = Symbol('ATHLETE_READ_REPO');

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

export interface AthleteReadRepository {
  findOneWithDetails(athleteId: string): Promise<AthleteDetails | null>;
  findAllWithDetails(athleteUserIds: string[]): Promise<AthleteDetails[]>;
  getOne(athleteId: string): Promise<Athlete | null>;
  getAll(athleteUserIds: string[]): Promise<Athlete[]>;
}