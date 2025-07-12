import { Exercise } from "../../domain/exercise.entity";

export const EXERCISE_REPO = Symbol('EXERCISE_REPO');

export interface IExerciseRepository {
  getOne(id: string, organizationId: string): Promise<Exercise | null>;
  getAll(organizationId: string): Promise<Exercise[]>;
  search(query: string, organizationId: string): Promise<Exercise[]>;
  save(exercise: Exercise): Promise<void>;
  remove(exercise: Exercise): Promise<void>;
} 