import { ITrainingSessionRepository } from '../ports/training-session.repository.port';
import { IOrganizationUseCases } from '../../../identity/application/ports/organization-use-cases.port';
import { CreateTrainingSession, UpdateAthleteTrainingSession, UpdateTrainingSession } from '@dropit/schemas';
import { TrainingSession } from '../../domain/training-session.entity';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';
import { IAthleteTrainingSessionRepository } from '../ports/athlete-training-session.repository.port';
import { IAthleteRepository } from '../../../athletes/application/ports/athlete.repository.port';
import { IWorkoutRepository } from '../ports/workout.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { ITrainingSessionUseCases } from '../ports/training-session-use-cases.port';
import {
  TrainingSessionNotFoundException,
  TrainingSessionAccessDeniedException,
  AthleteNotFoundException,
  WorkoutNotFoundException,
  AthletesNotInOrganizationException,
  TrainingSessionValidationException,
} from '../exceptions/training-session.exceptions';

/**
 * Training Session Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of training session business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class TrainingSessionUseCase implements ITrainingSessionUseCases {
  constructor(
    private readonly trainingSessionRepository: ITrainingSessionRepository,
    private readonly athleteTrainingSessionRepository: IAthleteTrainingSessionRepository,
    private readonly organizationUseCases: IOrganizationUseCases,
    private readonly workoutRepository: IWorkoutRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(trainingSessionId: string, organizationId: string, userId: string): Promise<TrainingSession> {
    //1. Check if current user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new TrainingSessionAccessDeniedException('Only coaches can access this resource');
    }

    //2. Get session from repository
    const trainingSession = await this.trainingSessionRepository.getOneWithDetails(trainingSessionId, organizationId);

    //3. Validate session
    if (!trainingSession) {
      throw new TrainingSessionNotFoundException('Training session not found');
    }

    return trainingSession;
  }

  async getAll(organizationId: string, userId: string): Promise<TrainingSession[]> {
    //1. Check if current user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new TrainingSessionAccessDeniedException('Only coaches can access this resource');
    }

    //2. Get sessions from repository
    const trainingSessions = await this.trainingSessionRepository.getAllWithDetails(organizationId);

    //3. Validate sessions
    if (!trainingSessions) {
      throw new TrainingSessionNotFoundException('Training sessions not found');
    }

    return trainingSessions;
  }

  async getByAthlete(athleteId: string, organizationId: string, userId: string, startDate?: string, endDate?: string): Promise<TrainingSession[]> {
    //1. Check if current user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    //2. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException('Athlete not found or not associated with a user');
    }

    //3. Check if current user is same as userId in athleteId or is coach of the organization
    if (athlete.user.id !== userId && !isCoach) {
      throw new TrainingSessionAccessDeniedException('User is not authorized to access this resource');
    }

    //4. Get training sessions from repository
    const trainingSessions = await this.trainingSessionRepository.getByAthleteWithDetails(athleteId, organizationId, startDate, endDate);

    //5. Validate sessions
    if (!trainingSessions) {
      throw new TrainingSessionNotFoundException('Training sessions not found');
    }

    return trainingSessions;
  }

  async getAthleteTrainingSessions(athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession[]> {
    //1. Check if current user is admin of the organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    //2. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException('Athlete not found or not associated with a user');
    }

    //3. Check if current user is same as userId in athleteId or is admin of the organization
    if (athlete.user.id !== userId && !isAdmin) {
      throw new TrainingSessionAccessDeniedException('User is not authorized to access this resource');
    }

    //4. Get athlete training sessions from repository
    const athleteTrainingSessions = await this.athleteTrainingSessionRepository.getAllWithDetails(athleteId);

    //5. Validate athlete training sessions
    if (!athleteTrainingSessions) {
      throw new TrainingSessionNotFoundException('Athlete training sessions not found');
    }

    return athleteTrainingSessions;
  }

  async getOneAthleteTrainingSession(trainingSessionId: string, athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession> {
    //1. Check if current user is admin of the organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    //2. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException('Athlete not found or not associated with a user');
    }

    //3. Check if current user is same as userId in athleteId or is admin of the organization
    if (athlete.user.id !== userId && !isAdmin) {
      throw new TrainingSessionAccessDeniedException('User is not authorized to access this resource');
    }

    //4. Get athlete training session from repository
    const athleteTrainingSession = await this.athleteTrainingSessionRepository.getOneWithDetails(athleteId, trainingSessionId);

    //5. Validate session
    if (!athleteTrainingSession) {
      throw new TrainingSessionNotFoundException('Athlete training session not found');
    }

    return athleteTrainingSession;
  }

  async create(data: CreateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession> {
    //1. Get organization from repository
    const organization = await this.organizationUseCases.getOne(organizationId);

    //2. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new TrainingSessionAccessDeniedException('User is not admin of this organization');
    }

    //3. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //4. Check if workout exists
    const workout = await this.workoutRepository.getOne(data.workoutId, coachFilterConditions);

    if (!workout) {
      throw new WorkoutNotFoundException(
        `Workout with ID ${data.workoutId} not found`
      );
    }

    //5. Get all athletes IDs from organization
    const athleteIds = await this.memberUseCases.getAthleteUserIds(organizationId);

    //5. Valide all requested athletes belong to this organization
    const invalidAthleteIds = data.athleteIds.filter(athleteId => !athleteIds.includes(athleteId));

    if (invalidAthleteIds.length > 0) {
      throw new AthletesNotInOrganizationException(`Athletes with IDs ${invalidAthleteIds.join(', ')} do not belong to this organization`);
    }

    //6. Create training session
    const trainingSession = new TrainingSession();
    trainingSession.workout = workout;
    trainingSession.scheduledDate = new Date(data.scheduledDate);
    trainingSession.organization = organization;

    await this.trainingSessionRepository.save(trainingSession);

    //7. Get created training session from repository
    const createdTrainingSession = await this.trainingSessionRepository.getOne(trainingSession.id, organizationId);

    if (!createdTrainingSession) {
      throw new TrainingSessionNotFoundException('Training session not found');
    }

    //8. Create athlete training sessions
    const athletes = await this.athleteRepository.getAll(data.athleteIds);

    for (const a of athletes) {
      try {
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = a;
        athleteTrainingSession.trainingSession = createdTrainingSession;
        await this.athleteTrainingSessionRepository.save(athleteTrainingSession);
      } catch (error) {
        throw new TrainingSessionValidationException(`Error creating athlete training session for athlete ${a.id}: ${error}`);
      }
    }

    return createdTrainingSession;
  }

  async update(sessionId: string, data: UpdateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession> {
    //1. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new TrainingSessionAccessDeniedException('User is not admin of this organization');
    }

    //2. Get training session to update from repository
    const trainingSessionToUpdate = await this.trainingSessionRepository.getOne(sessionId, organizationId);

    if (!trainingSessionToUpdate) {
      throw new TrainingSessionNotFoundException('TrainingSession not found');
    }

    //3. Update workout if needed
    if (data.workoutId) {
      //3. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      //4. Get workout from repository
      const workout = await this.workoutRepository.getOne(data.workoutId, coachFilterConditions);

      if (!workout) {
        throw new WorkoutNotFoundException(
          `Workout with ID ${data.workoutId} not found`
        );
      }
      trainingSessionToUpdate.workout = workout;
    }

    //4. Update athletes if needed
    if (data.athleteIds) {
      // Delete existing athlete sessions
      const existingAthleteSessions = trainingSessionToUpdate.athletes.getItems();
      for (const athleteSession of existingAthleteSessions) {
        await this.athleteTrainingSessionRepository.remove(athleteSession);
      }

      // Validate all athletes exist before creating new sessions
      const athletes = await this.athleteRepository.getAll(data.athleteIds);
      const foundAthleteIds = athletes.map(a => a.id);
      const missingAthleteIds = data.athleteIds.filter(id => !foundAthleteIds.includes(id));

      if (missingAthleteIds.length > 0) {
        throw new AthleteNotFoundException(`Athletes with IDs ${missingAthleteIds.join(', ')} not found`);
      }

      // Create new athlete sessions
      for (const athlete of athletes) {
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = athlete;
        athleteTrainingSession.trainingSession = trainingSessionToUpdate;
        await this.athleteTrainingSessionRepository.save(athleteTrainingSession);
      }
    }

    //5. Update scheduled date if needed
    if (data.scheduledDate) {
      trainingSessionToUpdate.scheduledDate = new Date(data.scheduledDate);
    }

    //6. Update completed date if needed
    if (data.completedDate) {
      trainingSessionToUpdate.completedDate = new Date(data.completedDate);
    }

    //7. Update training session in repository
    await this.trainingSessionRepository.save(trainingSessionToUpdate);

    //8. Get updated training session with all details
    const updatedTrainingSession = await this.trainingSessionRepository.getOneWithDetails(sessionId, organizationId);

    if (!updatedTrainingSession) {
      throw new TrainingSessionNotFoundException('Updated training session not found');
    }

    return updatedTrainingSession;
  }

  async updateAthleteTrainingSession(athleteId: string, athleteTrainingSessionId: string, data: UpdateAthleteTrainingSession, userId: string): Promise<AthleteTrainingSession> {
    //1. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new AthleteNotFoundException('Athlete not found or not associated with a user');
    }

    //2. Check if current user is same as userId in athleteId
    if (athlete.user.id !== userId) {
      throw new TrainingSessionAccessDeniedException('User is not authorized to access this resource');
    }

    //3. Get athlete training session to update from repository
    const athleteTrainingSessionToUpdate = await this.athleteTrainingSessionRepository.getOneWithDetails(athleteId, athleteTrainingSessionId);

    if (!athleteTrainingSessionToUpdate) {
      throw new TrainingSessionNotFoundException('Athlete training session not found');
    }

    //4. Update notes_athlete if needed
    if (data.notes_athlete) {
      athleteTrainingSessionToUpdate.notes_athlete = data.notes_athlete;
    }

    //5. Update athlete training session in repository
    await this.athleteTrainingSessionRepository.save(athleteTrainingSessionToUpdate);

    //6. Get updated athlete training session with all details
    const updatedAthleteTrainingSession = await this.athleteTrainingSessionRepository.getOneWithDetails(athleteId, athleteTrainingSessionId);

    if (!updatedAthleteTrainingSession) {
      throw new TrainingSessionNotFoundException('Updated athlete training session not found');
    }

    return updatedAthleteTrainingSession;
  }

  async delete(trainingSessionId: string, organizationId: string, userId: string): Promise<void> {
    //1. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new TrainingSessionAccessDeniedException('User is not admin of this organization');
    }

    //2. Get training session to delete from repository
    const trainingSessionToDelete = await this.trainingSessionRepository.getOne(trainingSessionId, organizationId);

    if (!trainingSessionToDelete) {
      throw new TrainingSessionNotFoundException('Training session not found');
    }

    //3. Delete training session
    await this.trainingSessionRepository.remove(trainingSessionToDelete);
  }
}
