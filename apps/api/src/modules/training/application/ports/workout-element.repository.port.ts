import { WorkoutElement } from '../../domain/workout-element.entity';

export const WORKOUT_ELEMENT_REPO = 'WorkoutElementRepository';

export interface IWorkoutElementRepository {
  save(workoutElement: WorkoutElement): Promise<void>;
  remove(id: string, organizationId: string): Promise<void>;
} 