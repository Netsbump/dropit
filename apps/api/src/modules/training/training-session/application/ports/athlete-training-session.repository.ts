import { AthleteTrainingSession } from "../../domain/athlete-training-session.entity";

export const ATHLETE_TRAINING_SESSION_REPO = Symbol('ATHLETE_TRAINING_SESSION_REPO');

export interface AthleteTrainingSessionRepository {
  getAllWithDetails(athleteId: string): Promise<AthleteTrainingSession[]>;
  getOneWithDetails(athleteId: string, trainingSessionId: string): Promise<AthleteTrainingSession | null>;

  save(athleteTrainingSession: AthleteTrainingSession): Promise<void>;
  remove(athleteTrainingSession: AthleteTrainingSession): Promise<void>;
}