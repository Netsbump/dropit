import { Workout } from '../../domain/workout.entity';

export const WORKOUT_REPO = 'WORKOUT_REPO';

export interface IWorkoutRepository {
  getAll(organizationId: string): Promise<Workout[]>;
  getOne(id: string, organizationId: string): Promise<Workout | null>;
  getOneWithDetails(id: string, organizationId: string): Promise<Workout | null>;
  save(workout: Workout): Promise<Workout>;
  remove(id: string, organizationId: string): Promise<void>;
} 