import { SessionDto } from '@dropit/schemas';
import { Session } from '../../entities';
import { WorkoutMapper } from '../workout/workout.mapper';
export const SessionMapper = {
  toDto(session: Session): SessionDto {
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

  toDtoList(sessions: Session[]): SessionDto[] {
    return sessions.map((session) => SessionMapper.toDto(session));
  },
};
