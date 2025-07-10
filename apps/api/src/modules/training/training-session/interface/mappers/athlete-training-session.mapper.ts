import { AthleteTrainingSessionDto} from '@dropit/schemas';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';

export const AthleteTrainingSessionMapper = {
  toDto(athleteTrainingSession: AthleteTrainingSession): AthleteTrainingSessionDto {
    return {
    athleteId: athleteTrainingSession.athlete.id,
    trainingSessionId: athleteTrainingSession.trainingSession.id,
    notes_athlete: athleteTrainingSession.notes_athlete,
    createdAt: athleteTrainingSession.createdAt,
    updatedAt: athleteTrainingSession.updatedAt,
    };
  },

  toDtoList(athleteTrainingSessions: AthleteTrainingSession[]): AthleteTrainingSessionDto[] {
    return athleteTrainingSessions.map(this.toDto);
  },
};
