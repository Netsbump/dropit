import { CreateWorkoutCategory, UpdateWorkoutCategory } from '@dropit/schemas';
import { WorkoutCategory } from '../../domain/workout-category.entity';

/**
 * Workout Category Use Cases Port
 *
 * @description
 * Defines the contract for workout category business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * WorkoutCategoryUseCase and injected into controllers via dependency injection.
 */
export interface IWorkoutCategoryUseCases {
  /**
   * Get one workout category by ID
   */
  getOne(workoutCategoryId: string, userId: string, organizationId: string): Promise<WorkoutCategory>;

  /**
   * Get all workout categories for an organization
   */
  getAll(userId: string, organizationId: string): Promise<WorkoutCategory[]>;

  /**
   * Create a new workout category
   */
  create(data: CreateWorkoutCategory, organizationId: string, userId: string): Promise<WorkoutCategory>;

  /**
   * Update a workout category
   */
  update(workoutCategoryId: string, data: UpdateWorkoutCategory, organizationId: string, userId: string): Promise<WorkoutCategory>;

  /**
   * Delete a workout category
   */
  delete(workoutCategoryId: string, organizationId: string, userId: string): Promise<void>;
}

/**
 * Injection token for IWorkoutCategoryUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const WORKOUT_CATEGORY_USE_CASES = Symbol('WORKOUT_CATEGORY_USE_CASES');
