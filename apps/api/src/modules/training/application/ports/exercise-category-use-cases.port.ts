import { CreateExerciseCategory, UpdateExerciseCategory } from '@dropit/schemas';
import { ExerciseCategory } from '../../domain/exercise-category.entity';

/**
 * Exercise Category Use Cases Port
 *
 * @description
 * Defines the contract for exercise category business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * ExerciseCategoryUseCase and injected into controllers via dependency injection.
 */
export interface IExerciseCategoryUseCases {
  /**
   * Get one exercise category by ID
   */
  getOne(exerciseCategoryId: string, organizationId: string, userId: string): Promise<ExerciseCategory>;

  /**
   * Get all exercise categories for an organization
   */
  getAll(organizationId: string, userId: string): Promise<ExerciseCategory[]>;

  /**
   * Create a new exercise category
   */
  create(data: CreateExerciseCategory, organizationId: string, userId: string): Promise<ExerciseCategory>;

  /**
   * Update an exercise category
   */
  update(exerciseCategoryId: string, data: UpdateExerciseCategory, organizationId: string, userId: string): Promise<ExerciseCategory>;

  /**
   * Delete an exercise category
   */
  delete(exerciseCategoryId: string, organizationId: string, userId: string): Promise<void>;
}

/**
 * Injection token for IExerciseCategoryUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const EXERCISE_CATEGORY_USE_CASES = Symbol('EXERCISE_CATEGORY_USE_CASES');
