import { CreateWorkout, UpdateWorkout } from '@dropit/schemas';
import { Workout } from '../../domain/workout.entity';

/**
 * Workout Use Cases Port
 *
 * @description
 * Defines the contract for workout business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * WorkoutUseCases and injected into controllers via dependency injection.
 */
export interface IWorkoutUseCases {
  /**
   * Get all workouts for an organization
   */
  getWorkouts(organizationId: string, userId: string): Promise<Workout[]>;

  /**
   * Get one workout by ID
   */
  getWorkout(workoutId: string, organizationId: string, userId: string): Promise<Workout>;

  /**
   * Get workout with details by ID
   */
  getWorkoutWithDetails(id: string, organizationId: string, userId: string): Promise<Workout>;

  /**
   * Create a new workout
   */
  createWorkout(workout: CreateWorkout, organizationId: string, userId: string): Promise<Workout>;

  /**
   * Update a workout
   */
  updateWorkout(id: string, workout: UpdateWorkout, organizationId: string, userId: string): Promise<Workout>;

  /**
   * Delete a workout
   */
  deleteWorkout(workoutId: string, organizationId: string, userId: string): Promise<void>;
}

/**
 * Injection token for IWorkoutUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const WORKOUT_USE_CASES = Symbol('WORKOUT_USE_CASES');
