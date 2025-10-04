import { CreateTrainingSession, UpdateAthleteTrainingSession, UpdateTrainingSession } from '@dropit/schemas';
import { TrainingSession } from '../../domain/training-session.entity';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';

/**
 * Training Session Use Cases Port
 *
 * @description
 * Defines the contract for training session business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * TrainingSessionUseCase and injected into controllers via dependency injection.
 */
export interface ITrainingSessionUseCases {
  /**
   * Get one training session by ID
   */
  getOne(trainingSessionId: string, organizationId: string): Promise<TrainingSession>;

  /**
   * Get all training sessions for an organization
   */
  getAll(organizationId: string): Promise<TrainingSession[]>;

  /**
   * Create a new training session
   */
  create(data: CreateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession>;

  /**
   * Update a training session
   */
  update(sessionId: string, data: UpdateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession>;

  /**
   * Delete a training session
   */
  delete(trainingSessionId: string, organizationId: string, userId: string): Promise<void>;

  /**
   * Get all athlete training sessions for a training session
   */
  getAthleteTrainingSessions(athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession[]>;

  /**
   * Get one athlete training session by ID
   */
  getOneAthleteTrainingSession(trainingSessionId: string, athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession>;

  /**
   * Update athlete training session
   */
  updateAthleteTrainingSession(
    athleteId: string,
    athleteTrainingSessionId: string,
    data: UpdateAthleteTrainingSession,
    userId: string
  ): Promise<AthleteTrainingSession>;
}

/**
 * Injection token for ITrainingSessionUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const TRAINING_SESSION_USE_CASES = Symbol('TRAINING_SESSION_USE_CASES');
