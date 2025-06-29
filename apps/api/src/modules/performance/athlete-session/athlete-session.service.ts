import {
  AthleteSessionDto,
  CreateAthleteSession,
  UpdateAthleteSession,
} from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteRepository } from '../../members/athlete/athlete.repository';
import { TrainingSession } from '../training-session/training-session.entity';
import { AthleteSession } from './athlete-session.entity';
@Injectable()
export class AthleteSessionService {
  constructor(
    private readonly em: EntityManager,
    private readonly athleteRepository: AthleteRepository
  ) {}

  async getAthleteSessions(): Promise<AthleteSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteSession,
      {},
      { populate: ['athlete', 'session'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async getAthleteSession(
    athleteId: string,
    sessionId: string
  ): Promise<AthleteSessionDto> {
    const athleteSession = await this.em.findOne(
      AthleteSession,
      { athlete: { id: athleteId }, session: { id: sessionId } },
      { populate: ['athlete', 'session'] }
    );
    if (!athleteSession) {
      throw new NotFoundException('AthleteSession not found');
    }
    return this.mapToDto(athleteSession);
  }

  async getAthleteSessionsByAthlete(
    athleteId: string
  ): Promise<AthleteSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteSession,
      { athlete: { id: athleteId } },
      { populate: ['athlete', 'session'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async getAthleteSessionsBySession(
    sessionId: string
  ): Promise<AthleteSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteSession,
      { session: { id: sessionId } },
      { populate: ['athlete', 'session'] }
    );
    return athleteSessions.map((athleteSession) =>
      this.mapToDto(athleteSession)
    );
  }

  async createAthleteSession(
    athleteSession: CreateAthleteSession
  ): Promise<AthleteSessionDto> {
    const athlete = await this.em.findOne(Athlete, {
      id: athleteSession.athleteId,
    });

    if (!athlete) {
      throw new NotFoundException(
        `Athlete with ID ${athleteSession.athleteId} not found`
      );
    }

    const session = await this.em.findOne(TrainingSession, {
      id: athleteSession.sessionId,
    });
    if (!session) {
      throw new NotFoundException(
        `TrainingSession with ID ${athleteSession.sessionId} not found`
      );
    }

    // Vérifier si l'association existe déjà
    const existingLink = await this.em.findOne(AthleteSession, {
      athlete: { id: athleteSession.athleteId },
      session: { id: athleteSession.sessionId },
    });

    if (existingLink) {
      throw new Error('This athlete is already associated with this session');
    }

    const athleteSessionToCreate = new AthleteSession();
    athleteSessionToCreate.athlete = athlete;
    athleteSessionToCreate.session = session;
    athleteSessionToCreate.notes_athlete = athleteSession.notes_athlete;

    await this.em.persistAndFlush(athleteSessionToCreate);
    return this.mapToDto(athleteSessionToCreate);
  }

  async updateAthleteSession(
    athleteId: string,
    sessionId: string,
    athleteSession: UpdateAthleteSession
  ): Promise<AthleteSessionDto> {
    const athleteSessionToUpdate = await this.em.findOne(
      AthleteSession,
      { athlete: { id: athleteId }, session: { id: sessionId } },
      { populate: ['athlete', 'session'] }
    );
    if (!athleteSessionToUpdate) {
      throw new NotFoundException('AthleteSession not found');
    }

    if (athleteSession.notes_athlete !== undefined) {
      athleteSessionToUpdate.notes_athlete = athleteSession.notes_athlete;
    }

    await this.em.persistAndFlush(athleteSessionToUpdate);
    return this.mapToDto(athleteSessionToUpdate);
  }

  async deleteAthleteSession(
    athleteId: string,
    sessionId: string
  ): Promise<void> {
    const athleteSession = await this.em.findOne(AthleteSession, {
      athlete: { id: athleteId },
      session: { id: sessionId },
    });
    if (!athleteSession) {
      throw new NotFoundException('AthleteSession not found');
    }

    await this.em.removeAndFlush(athleteSession);
  }

  private mapToDto(athleteSession: AthleteSession): AthleteSessionDto {
    return {
      athleteId: athleteSession.athlete.id,
      sessionId: athleteSession.session.id,
      notes_athlete: athleteSession.notes_athlete,
      createdAt: athleteSession.createdAt,
      updatedAt: athleteSession.updatedAt,
    };
  }
}
