import { WorkoutCategory } from "../../domain/workout-category.entity";
import { CoachFilterConditions } from "../../../identity/application/ports/member.repository";

export const WORKOUT_CATEGORY_REPO = Symbol('WORKOUT_CATEGORY_REPO');

export interface IWorkoutCategoryRepository {
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<WorkoutCategory | null>;
  getAll(coachFilterConditions: CoachFilterConditions): Promise<WorkoutCategory[]>;
  save(workoutCategory: WorkoutCategory): Promise<void>;
  remove(workoutCategory: WorkoutCategory): Promise<void>;
} 