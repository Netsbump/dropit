import { ExerciseCategory } from "../../domain/exercise-category.entity";
import { CoachFilterConditions } from "../../../identity/application/ports/member.repository.port";

export const EXERCISE_CATEGORY_REPO = Symbol('EXERCISE_CATEGORY_REPO');

export interface IExerciseCategoryRepository {
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<ExerciseCategory | null>;
  getAll(coachFilterConditions: CoachFilterConditions): Promise<ExerciseCategory[]>;
  save(exerciseCategory: ExerciseCategory): Promise<void>;
  remove(exerciseCategory: ExerciseCategory): Promise<void>;
}