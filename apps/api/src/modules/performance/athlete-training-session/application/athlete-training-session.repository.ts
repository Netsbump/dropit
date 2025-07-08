import { AthleteTrainingSession } from "../domain/athlete-training-session.entity";

export interface AthleteTrainingSessionRepository {
  save(athleteTrainingSession: AthleteTrainingSession): Promise<void>;
  ofIds(athleteId: string, trainingSessionId: string): Promise<AthleteTrainingSession | null>;
  getAll(athleteUserIds: string[]): Promise<AthleteTrainingSession[]>;
  remove(athleteTrainingSession: AthleteTrainingSession): Promise<void>;
}