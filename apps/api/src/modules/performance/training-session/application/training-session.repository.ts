import { TrainingSession } from "../domain/training-session.entity";

export interface TrainingSessionRepository {
  getAllWithDetails(organizationId: string): Promise<TrainingSession[]>;
  getOneWithDetails(id: string, organizationId: string): Promise<TrainingSession | null>;
  save(trainingSession: TrainingSession): Promise<TrainingSession>;
  update(id: string, trainingSession: TrainingSession): Promise<TrainingSession>;
  remove(id: string): Promise<void>;
  getAllWithDetailsByAthlete(athleteId: string): Promise<TrainingSession[]>;
  getOneWithDetailsByAthlete(athleteId: string, id: string): Promise<TrainingSession>;
}