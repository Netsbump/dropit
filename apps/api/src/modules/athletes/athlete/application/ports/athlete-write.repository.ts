import { Athlete } from "../../domain/athlete.entity";

export const ATHLETE_WRITE_REPO = Symbol('ATHLETE_WRITE_REPO');

export interface AthleteWriteRepository {
    save(athlete: Athlete): Promise<void>;
    remove(athlete: Athlete): Promise<void>;
  }