import { ExerciseCategory } from "../../domain/exercise-category.entity";

export const EXERCISE_CATEGORY_REPO = Symbol('EXERCISE_CATEGORY_REPO');

export interface IExerciseCategoryRepository {
  getOne(id: string): Promise<ExerciseCategory | null>;
  getAll(): Promise<ExerciseCategory[]>;
  save(exerciseCategory: ExerciseCategory): Promise<void>;
  remove(exerciseCategory: ExerciseCategory): Promise<void>;
}