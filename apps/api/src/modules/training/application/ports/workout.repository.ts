import { Workout } from '../../domain/workout.entity';
import { CoachFilterConditions } from '../../../identity/application/ports/member.repository.port';

export const WORKOUT_REPO = 'WORKOUT_REPO';

export interface IWorkoutRepository {
  getAll(coachFilterConditions: CoachFilterConditions): Promise<Workout[]>;
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<Workout | null>;
  getOneWithDetails(id: string, coachFilterConditions: CoachFilterConditions): Promise<Workout | null>;
  save(workout: Workout): Promise<Workout>;
  remove(id: string, coachFilterConditions: CoachFilterConditions): Promise<void>;
} 