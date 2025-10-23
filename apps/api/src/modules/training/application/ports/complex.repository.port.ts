import { Complex } from "../../domain/complex.entity";
import { CoachFilterConditions } from "../../../identity/application/ports/member.repository.port";

export const COMPLEX_REPO = Symbol('COMPLEX_REPO');

export interface IComplexRepository {
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<Complex | null>;
  getAll(coachFilterConditions: CoachFilterConditions): Promise<Complex[]>;
  save(complex: Complex): Promise<void>;
  remove(complex: Complex): Promise<void>;
} 