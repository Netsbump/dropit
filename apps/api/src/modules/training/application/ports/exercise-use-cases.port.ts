import { CreateExercise, UpdateExercise } from '@dropit/schemas';
import { Exercise } from '../../domain/exercise.entity';

/**
 * Exercise Use Cases Port
 *
 * @description
 * Defines the contract for exercise business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * ExerciseUseCase and injected into controllers via dependency injection.
 */
export interface IExerciseUseCases {
  /**
   * Get one exercise by ID
   */
  getOne(exerciseId: string, organizationId: string, userId: string): Promise<Exercise>;

  /**
   * Get all exercises for an organization
   */
  getAll(organizationId: string, userId: string): Promise<Exercise[]>;

  /**
   * Create a new exercise
   */
  create(data: CreateExercise, userId: string, organizationId: string): Promise<Exercise>;

  /**
   * Update an exercise
   */
  update(exerciseId: string, data: UpdateExercise, userId: string, organizationId: string): Promise<Exercise>;

  /**
   * Search exercises by name
   */
  search(query: string, organizationId: string, userId: string): Promise<Exercise[]>;

  /**
   * Delete an exercise
   */
  delete(exerciseId: string, userId: string, organizationId: string): Promise<void>;
}

/**
 * Injection token for IExerciseUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const EXERCISE_USE_CASES = Symbol('EXERCISE_USE_CASES');
