import { TrainingSession } from "../../domain/training-session.entity";

export const TRAINING_SESSION_REPO = Symbol('TRAINING_SESSION_REPO');

export interface ITrainingSessionRepository {
  getOne(id: string, organizationId: string): Promise<TrainingSession | null>;
  
  getAllWithDetails(organizationId: string): Promise<TrainingSession[]>;
  getOneWithDetails(id: string, organizationId: string): Promise<TrainingSession | null>;

  save(trainingSession: TrainingSession): Promise<void>;
  remove(trainingSession: TrainingSession): Promise<void>;
}