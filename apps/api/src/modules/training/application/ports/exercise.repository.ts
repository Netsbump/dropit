import { Exercise } from "../../domain/exercise.entity";
import { CoachFilterConditions } from "../../../identity/application/ports/member.repository";

export const EXERCISE_REPO = Symbol('EXERCISE_REPO');

export interface IExerciseRepository {
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<Exercise | null>;
  getAll(coachFilterConditions: CoachFilterConditions): Promise<Exercise[]>;
  search(query: string, coachFilterConditions: CoachFilterConditions): Promise<Exercise[]>;
  save(exercise: Exercise): Promise<void>;
  remove(exercise: Exercise): Promise<void>;
} 