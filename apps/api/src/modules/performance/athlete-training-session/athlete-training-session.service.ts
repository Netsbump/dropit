import {
  AthleteTrainingSessionDto,
  CreateAthleteTrainingSession,
  UpdateAthleteTrainingSession,
} from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteRepository } from '../../members/athlete/athlete.repository';
import { TrainingSession } from '../training-session/training-session.entity';
import { AthleteTrainingSession } from './athlete-training-session.entity';
@Injectable()
export class AthleteTrainingSessionService {
  constructor(
    private readonly em: EntityManager,
    private readonly athleteRepository: AthleteRepository
  ) {}

  async getAthleteTrainingSessions(): Promise<AthleteTrainingSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteTrainingSession,
      {},
      { populate: ['athlete', 'trainingSession'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async getAthleteTrainingSession(
    athleteId: string,
    sessionId: string
  ): Promise<AthleteTrainingSessionDto> {
    const athleteSession = await this.em.findOne(
      AthleteTrainingSession,
      { athlete: { id: athleteId }, trainingSession: { id: sessionId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    if (!athleteSession) {
      throw new NotFoundException('AthleteTrainingSession not found');
    }
    return this.mapToDto(athleteSession);
  }

  async getAthleteTrainingSessionsByAthlete(
    athleteId: string
  ): Promise<AthleteTrainingSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteTrainingSession,
      { athlete: { id: athleteId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async getAthleteTrainingSessionsBySession(
    sessionId: string
  ): Promise<AthleteTrainingSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteTrainingSession,
      { trainingSession: { id: sessionId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async createAthleteTrainingSession(
    athleteTrainingSession: CreateAthleteTrainingSession
  ): Promise<AthleteTrainingSessionDto> {
    const athlete = await this.em.findOne(Athlete, {
      id: athleteTrainingSession.athleteId,
    });

    if (!athlete) {
      throw new NotFoundException(
        `Athlete with ID ${athleteTrainingSession.athleteId} not found`
      );
    }

    const trainingSession = await this.em.findOne(TrainingSession, {
      id: athleteTrainingSession.trainingSessionId,
    });
    if (!trainingSession) {
      throw new NotFoundException(
        `TrainingSession with ID ${athleteTrainingSession.trainingSessionId} not found`
      );
    } 

    // Vérifier si l'association existe déjà
    const existingLink = await this.em.findOne(AthleteTrainingSession, {
      athlete: { id: athleteTrainingSession.athleteId },
      trainingSession: { id: athleteTrainingSession.trainingSessionId },
    });

    if (existingLink) {
      throw new Error('This athlete is already associated with this session');
    }

    const athleteTrainingSessionToCreate = new AthleteTrainingSession();
    athleteTrainingSessionToCreate.athlete = athlete;
    athleteTrainingSessionToCreate.trainingSession = trainingSession;
    athleteTrainingSessionToCreate.notes_athlete = athleteTrainingSession.notes_athlete;

    await this.em.persistAndFlush(athleteTrainingSessionToCreate);
    return this.mapToDto(athleteTrainingSessionToCreate);
  }

  async updateAthleteTrainingSession(
    athleteId: string,
    sessionId: string,
    athleteTrainingSession: UpdateAthleteTrainingSession
  ): Promise<AthleteTrainingSessionDto> {
    const athleteTrainingSessionToUpdate = await this.em.findOne(
      AthleteTrainingSession,
      { athlete: { id: athleteId }, trainingSession: { id: sessionId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    if (!athleteTrainingSessionToUpdate) {
      throw new NotFoundException('AthleteTrainingSession not found');
    }

    if (athleteTrainingSession.notes_athlete !== undefined) {
      athleteTrainingSessionToUpdate.notes_athlete = athleteTrainingSession.notes_athlete;
    }

    await this.em.persistAndFlush(athleteTrainingSessionToUpdate);
    return this.mapToDto(athleteTrainingSessionToUpdate);
  }

  async deleteAthleteTrainingSession(
    athleteId: string,
    sessionId: string
  ): Promise<void> {
    const athleteTrainingSession = await this.em.findOne(AthleteTrainingSession, {
      athlete: { id: athleteId },
      trainingSession: { id: sessionId },
    });
    if (!athleteTrainingSession) {
      throw new NotFoundException('AthleteTrainingSession not found');
    }

    await this.em.removeAndFlush(athleteTrainingSession); 
  }

  private mapToDto(athleteTrainingSession: AthleteTrainingSession): AthleteTrainingSessionDto {
    return {
      athleteId: athleteTrainingSession.athlete.id,
      trainingSessionId: athleteTrainingSession.trainingSession.id,
      notes_athlete: athleteTrainingSession.notes_athlete,
      createdAt: athleteTrainingSession.createdAt,
      updatedAt: athleteTrainingSession.updatedAt,
    };
  }
}
