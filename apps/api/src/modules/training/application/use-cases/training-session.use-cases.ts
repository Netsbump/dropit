import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITrainingSessionRepository, TRAINING_SESSION_REPO } from '../ports/training-session.repository';
import { OrganizationUseCases } from '../../../identity/application/organization.use-cases';
import { CreateTrainingSession, UpdateAthleteTrainingSession, UpdateTrainingSession } from '@dropit/schemas';
import { TrainingSession } from '../../domain/training-session.entity';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';
import { IAthleteTrainingSessionRepository, ATHLETE_TRAINING_SESSION_REPO } from '../ports/athlete-training-session.repository';
import { ATHLETE_REPO, IAthleteRepository } from '../../../athletes/application/ports/athlete.repository';
import { IWorkoutRepository, WORKOUT_REPO } from '../ports/workout.repository';
import { MemberUseCases } from '../../../identity/application/member.use-cases';

@Injectable()
export class TrainingSessionUseCase {
  constructor(
    @Inject(TRAINING_SESSION_REPO)
    private readonly trainingSessionRepository: ITrainingSessionRepository,
    @Inject(ATHLETE_TRAINING_SESSION_REPO)
    private readonly athleteTrainingSessionRepository: IAthleteTrainingSessionRepository,
    private readonly organizationUseCases: OrganizationUseCases,
    @Inject(WORKOUT_REPO)
    private readonly workoutRepository: IWorkoutRepository,
    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getOne(trainingSessionId: string, organizationId: string): Promise<TrainingSession> {
    //1. Get session from repository
    const trainingSession = await this.trainingSessionRepository.getOneWithDetails(trainingSessionId, organizationId);

    //2. Validate session
    if (!trainingSession) {
      throw new NotFoundException('Training session not found');
    }

    return trainingSession;
  }

  async getAll(organizationId: string): Promise<TrainingSession[]> {
    //1. Get sessions from repository
    const trainingSessions = await this.trainingSessionRepository.getAllWithDetails(organizationId);

    //2. Validate sessions
    if (!trainingSessions) {
      throw new NotFoundException('Training sessions not found');
    }

    return trainingSessions;
  }

  async getAthleteTrainingSessions(athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession[]> {
    //1. Check if current user is admin of the organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    //2. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new NotFoundException('Athlete not found or not associated with a user');
    }

    //3. Check if current user is same as userId in athleteId or is admin of the organization
    if (athlete.user.id !== userId && !isAdmin) {
      throw new ForbiddenException('User is not authorized to access this resource');
    }

    //4. Get athlete training sessions from repository
    const athleteTrainingSessions = await this.athleteTrainingSessionRepository.getAllWithDetails(athleteId);

    //5. Validate athlete training sessions
    if (!athleteTrainingSessions) {
      throw new NotFoundException('Athlete training sessions not found');
    }

    return athleteTrainingSessions;
  }

  async getOneAthleteTrainingSession(trainingSessionId: string, athleteId: string, organizationId: string, userId: string): Promise<AthleteTrainingSession> {
    //1. Check if current user is admin of the organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    //2. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new NotFoundException('Athlete not found or not associated with a user');
    }

    //3. Check if current user is same as userId in athleteId or is admin of the organization
    if (athlete.user.id !== userId && !isAdmin) {
      throw new ForbiddenException('User is not authorized to access this resource');
    }

    //4. Get athlete training session from repository
    const athleteTrainingSession = await this.athleteTrainingSessionRepository.getOneWithDetails(athleteId, trainingSessionId);

    //5. Validate session
    if (!athleteTrainingSession) {
      throw new NotFoundException('Athlete training session not found');
    }

    return athleteTrainingSession;
  }

  async create(data: CreateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession> {
    //1. Get organization from repository
    const organization = await this.organizationUseCases.getOne(organizationId);

    //2. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new ForbiddenException('User is not admin of this organization');
    }

    //3. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //4. Check if workout exists
    const workout = await this.workoutRepository.getOne(data.workoutId, coachFilterConditions);

    if (!workout) {
      throw new NotFoundException(
        `Workout with ID ${data.workoutId} not found`
      );
    }

    //5. Get all athletes IDs from organization
    const athleteIds = await this.memberUseCases.getAthleteUserIds(organizationId);

    //5. Valide all requested athletes belong to this organization
    const invalidAthleteIds = data.athleteIds.filter(athleteId => !athleteIds.includes(athleteId));

    if (invalidAthleteIds.length > 0) {
      throw new BadRequestException(`Athletes with IDs ${invalidAthleteIds.join(', ')} do not belong to this organization`);
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
      throw new NotFoundException('Training session not found');
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
        throw new BadRequestException(`Error creating athlete training session for athlete ${a.id}: ${error}`);
      }
    }

    return createdTrainingSession;
  }

  async update(sessionId: string, data: UpdateTrainingSession, organizationId: string, userId: string): Promise<TrainingSession> {
    //1. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new ForbiddenException('User is not admin of this organization');
    }

    //2. Get training session to update from repository
    const trainingSessionToUpdate = await this.trainingSessionRepository.getOne(sessionId, organizationId);

    if (!trainingSessionToUpdate) {
      throw new NotFoundException('TrainingSession not found');
    }

    //3. Update workout if needed
    if (data.workoutId) {
      //3. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      //4. Get workout from repository
      const workout = await this.workoutRepository.getOne(data.workoutId, coachFilterConditions);

      if (!workout) {
        throw new NotFoundException(
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
        throw new NotFoundException(`Athletes with IDs ${missingAthleteIds.join(', ')} not found`);
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
      throw new NotFoundException('Updated training session not found');
    }

    return updatedTrainingSession;
  }

  async updateAthleteTrainingSession(athleteId: string, athleteTrainingSessionId: string, data: UpdateAthleteTrainingSession, userId: string): Promise<AthleteTrainingSession> {
    //1. Get athlete from repository
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new NotFoundException('Athlete not found or not associated with a user');
    }

    //2. Check if current user is same as userId in athleteId
    if (athlete.user.id !== userId) {
      throw new ForbiddenException('User is not authorized to access this resource');
    }

    //3. Get athlete training session to update from repository
    const athleteTrainingSessionToUpdate = await this.athleteTrainingSessionRepository.getOneWithDetails(athleteId, athleteTrainingSessionId);

    if (!athleteTrainingSessionToUpdate) {
      throw new NotFoundException('Athlete training session not found');
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
      throw new NotFoundException('Updated athlete training session not found');
    }

    return updatedAthleteTrainingSession;
  }

  async delete(trainingSessionId: string, organizationId: string, userId: string): Promise<void> {
    //1. Check if the user is admin of this organization
    const isAdmin = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isAdmin) {
      throw new ForbiddenException('User is not admin of this organization');
    }

    //2. Get training session to delete from repository
    const trainingSessionToDelete = await this.trainingSessionRepository.getOne(trainingSessionId, organizationId);

    if (!trainingSessionToDelete) {
      throw new NotFoundException('Training session not found');
    }

    //3. Delete training session
    await this.trainingSessionRepository.remove(trainingSessionToDelete);
  }
}
