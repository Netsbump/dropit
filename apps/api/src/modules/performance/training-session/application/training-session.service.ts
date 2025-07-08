import { CreateTrainingSession, TrainingSessionDto, UpdateTrainingSession } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../../members/athlete/domain/athlete.entity';
import { Workout } from '../../../training/workout/workout.entity';
import { AthleteTrainingSession } from '../athlete-training-session/domain/athlete-training-session.entity';
import { TrainingSession } from '../domain/training-session.entity';
import { TrainingSessionMapper } from '../interface/training-session.mapper';
import { Organization } from '../../../members/organization/organization.entity';

@Injectable()
export class TrainingSessionService {
  constructor(private readonly em: EntityManager) {}

  async getTrainingSessionsByAthlete(athleteId: string, organizationId: string): Promise<TrainingSessionDto[]> {
    const sessions = await this.em.find(
      TrainingSession,
      { athletes: { athlete: { id: athleteId } }, organization: { id: organizationId } },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    return sessions.map((session) => this.mapToDto(session));
  }

  async createTrainingSession(session: CreateTrainingSession, organizationId: string): Promise<TrainingSessionDto> {
    const organization = await this.em.findOne(Organization, { id: organizationId });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const workout = await this.em.findOne(Workout, { id: session.workoutId });
    if (!workout) {
      throw new NotFoundException(
        `Workout with ID ${session.workoutId} not found`
      );
    }

    const athletes: Athlete[] = [];
    for (const athleteId of session.athleteIds) {
      const athlete = await this.em.findOne(Athlete, { id: athleteId });
      if (!athlete) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }
      athletes.push(athlete);
    }

    const trainingSessionToCreate = new TrainingSession();
    trainingSessionToCreate.workout = workout;
    trainingSessionToCreate.scheduledDate = new Date(session.scheduledDate);
    trainingSessionToCreate.organization = organization;

    await this.em.persistAndFlush(trainingSessionToCreate);

    for (const athlete of athletes) {
      const athleteTrainingSession = new AthleteTrainingSession();
      athleteTrainingSession.athlete = athlete;
      athleteTrainingSession.trainingSession = trainingSessionToCreate;
      this.em.persist(athleteTrainingSession);
    }

    await this.em.flush();

    return this.getTrainingSession(trainingSessionToCreate.id, organizationId);
  }

  async updateTrainingSession(id: string, session: UpdateTrainingSession, organizationId: string): Promise<TrainingSessionDto> {
    const trainingSessionToUpdate = await this.em.findOne(
      TrainingSession,
      { id, organization: { id: organizationId } },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    if (!trainingSessionToUpdate) {
      throw new NotFoundException('TrainingSession not found');
    }

    if (session.workoutId) {
      const workout = await this.em.findOne(Workout, { id: session.workoutId });
      if (!workout) {
        throw new NotFoundException(
          `Workout with ID ${session.workoutId} not found`
        );
      }
      trainingSessionToUpdate.workout = workout;
    }

    if (session.athleteIds) {
      for (const athleteLink of trainingSessionToUpdate.athletes) {
        await this.em.removeAndFlush(athleteLink);
      }

      for (const athleteId of session.athleteIds) {
        const athlete = await this.em.findOne(Athlete, { id: athleteId });
        if (!athlete) {
          throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
        }
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = athlete;
        athleteTrainingSession.trainingSession = trainingSessionToUpdate;
        this.em.persist(athleteTrainingSession);
      }
    }

    if (session.scheduledDate) {
      trainingSessionToUpdate.scheduledDate = new Date(session.scheduledDate);
    }

    if (session.completedDate) {
      trainingSessionToUpdate.completedDate = new Date(session.completedDate);
    }

    await this.em.flush();
    return this.mapToDto(trainingSessionToUpdate);
  }

  async completeTrainingSession(
    id: string,
    organizationId: string,
    completedDate?: Date | string,
  ): Promise<TrainingSessionDto> {
    const trainingSessionToUpdate = await this.em.findOne(
      TrainingSession,
      { id, organization: { id: organizationId } },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    if (!trainingSessionToUpdate) {
      throw new NotFoundException('TrainingSession not found');
    }

    trainingSessionToUpdate.completedDate = completedDate
      ? new Date(completedDate)
      : new Date();

    await this.em.persistAndFlush(trainingSessionToUpdate);
    return this.mapToDto(trainingSessionToUpdate);
  }

  async deleteTrainingSession(id: string, organizationId: string): Promise<void> {
    const trainingSession = await this.em.findOne(
      TrainingSession,
      { id, organization: { id: organizationId } },
      { populate: ['athletes'] }
    );
    if (!trainingSession) {
      throw new NotFoundException('TrainingSession not found');
    }

    for (const athleteLink of trainingSession.athletes) {
      await this.em.removeAndFlush(athleteLink);
    }

    await this.em.removeAndFlush(trainingSession);  
  }

  private mapToDto(trainingSession: TrainingSession): TrainingSessionDto {
    const athletes = trainingSession.athletes.getItems().map((link) => ({
      id: link.athlete.id,
      firstName: link.athlete.firstName,
      lastName: link.athlete.lastName,
      birthday: link.athlete.birthday,
      country: link.athlete.country,
      userId: link.athlete.user?.id,
      createdAt: link.athlete.createdAt,
      updatedAt: link.athlete.updatedAt,
    }));

    const athleteSessions = trainingSession.athletes.getItems().map((link) => ({
      athleteId: link.athlete.id,
      sessionId: link.trainingSession.id,
      notes_athlete: link.notes_athlete,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    return {
      id: trainingSession.id,
      workout: {
        id: trainingSession.workout.id,
        title: trainingSession.workout.title,
        description: trainingSession.workout.description,
        workoutCategory: trainingSession.workout.category.id,
        elements: [],
      },
      athletes,
      scheduledDate: trainingSession.scheduledDate,
      completedDate: trainingSession.completedDate,
      createdAt: trainingSession.createdAt,
      updatedAt: trainingSession.updatedAt,
    };
  }
}
