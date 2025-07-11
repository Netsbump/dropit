import { TrainingSessionDto } from '@dropit/schemas';
import { WorkoutMapper } from './workout.mapper';
import { TrainingSession } from '../../domain/training-session.entity';

export const TrainingSessionMapper = {
  toDto(trainingSession: TrainingSession): TrainingSessionDto {
    const athletes = trainingSession.athletes.getItems().map((link) => ({
      id: link.athlete.id,
      firstName: link.athlete.firstName,
      lastName: link.athlete.lastName,
    }));

    return {
      id: trainingSession.id,
      workout: WorkoutMapper.toDto(trainingSession.workout),
      athletes,
      scheduledDate: trainingSession.scheduledDate,
      completedDate: trainingSession.completedDate,
      createdAt: trainingSession.createdAt,
      updatedAt: trainingSession.updatedAt,
    };
  },

  toDtoList(trainingSessions: TrainingSession[]): TrainingSessionDto[] {
    return trainingSessions.map((trainingSession) => TrainingSessionMapper.toDto(trainingSession));
  },
};
