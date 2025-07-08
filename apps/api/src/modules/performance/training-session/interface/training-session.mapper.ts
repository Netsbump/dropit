import { TrainingSessionDto } from '@dropit/schemas';
import { WorkoutMapper } from '../../../training/workout/workout.mapper';
import { TrainingSession } from '../domain/training-session.entity';

export const TrainingSessionMapper = {
  toDto(session: TrainingSession): TrainingSessionDto {
    const athletes = session.athletes.getItems().map((link) => ({
      id: link.athlete.id,
      firstName: link.athlete.firstName,
      lastName: link.athlete.lastName,
    }));

    return {
      id: session.id,
      workout: WorkoutMapper.toDto(session.workout),
      athletes,
      scheduledDate: session.scheduledDate,
      completedDate: session.completedDate,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  },

  toDtoList(sessions: TrainingSession[]): TrainingSessionDto[] {
    return sessions.map((session) => TrainingSessionMapper.toDto(session));
  },
};
