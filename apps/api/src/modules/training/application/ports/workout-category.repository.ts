import { WorkoutCategory } from "../../domain/workout-category.entity";

export const WORKOUT_CATEGORY_REPO = Symbol('WORKOUT_CATEGORY_REPO');

export interface IWorkoutCategoryRepository {
  getOne(id: string, userId: string, organizationId: string): Promise<WorkoutCategory | null>;
  getAll(userId: string, organizationId: string): Promise<WorkoutCategory[]>;
  save(workoutCategory: WorkoutCategory): Promise<void>;
  remove(workoutCategory: WorkoutCategory): Promise<void>;
} 