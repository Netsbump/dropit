import { CreateSession, SessionDto, UpdateSession } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteSession } from '../../entities/athlete-session.entity';
import { Athlete } from '../../entities/athlete.entity';
import { Session } from '../../entities/session.entity';
import { Workout } from '../../entities/workout.entity';

@Injectable()
export class SessionService {
  constructor(private readonly em: EntityManager) {}

  async getSessions(): Promise<SessionDto[]> {
    const sessions = await this.em.find(
      Session,
      {},
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    return sessions.map((session) => this.mapToDto(session));
  }

  async getSession(id: string): Promise<SessionDto> {
    const session = await this.em.findOne(
      Session,
      { id },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return this.mapToDto(session);
  }

  async getSessionsByAthlete(athleteId: string): Promise<SessionDto[]> {
    const sessions = await this.em.find(
      Session,
      { athletes: { athlete: { id: athleteId } } },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    return sessions.map((session) => this.mapToDto(session));
  }

  async createSession(session: CreateSession): Promise<SessionDto> {
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

    const sessionToCreate = new Session();
    sessionToCreate.workout = workout;
    sessionToCreate.scheduledDate = new Date(session.scheduledDate);

    await this.em.persistAndFlush(sessionToCreate);

    for (const athlete of athletes) {
      const athleteSession = new AthleteSession();
      athleteSession.athlete = athlete;
      athleteSession.session = sessionToCreate;
      this.em.persist(athleteSession);
    }

    await this.em.flush();

    return this.getSession(sessionToCreate.id);
  }

  async updateSession(id: string, session: UpdateSession): Promise<SessionDto> {
    const sessionToUpdate = await this.em.findOne(
      Session,
      { id },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    if (!sessionToUpdate) {
      throw new NotFoundException('Session not found');
    }

    if (session.workoutId) {
      const workout = await this.em.findOne(Workout, { id: session.workoutId });
      if (!workout) {
        throw new NotFoundException(
          `Workout with ID ${session.workoutId} not found`
        );
      }
      sessionToUpdate.workout = workout;
    }

    if (session.athleteIds) {
      for (const athleteLink of sessionToUpdate.athletes) {
        await this.em.removeAndFlush(athleteLink);
      }

      for (const athleteId of session.athleteIds) {
        const athlete = await this.em.findOne(Athlete, { id: athleteId });
        if (!athlete) {
          throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
        }
        const athleteSession = new AthleteSession();
        athleteSession.athlete = athlete;
        athleteSession.session = sessionToUpdate;
        this.em.persist(athleteSession);
      }
    }

    if (session.scheduledDate) {
      sessionToUpdate.scheduledDate = new Date(session.scheduledDate);
    }

    if (session.completedDate) {
      sessionToUpdate.completedDate = new Date(session.completedDate);
    }

    await this.em.flush();
    return this.mapToDto(sessionToUpdate);
  }

  async completeSession(
    id: string,
    completedDate?: Date | string
  ): Promise<SessionDto> {
    const sessionToUpdate = await this.em.findOne(
      Session,
      { id },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
    if (!sessionToUpdate) {
      throw new NotFoundException('Session not found');
    }

    sessionToUpdate.completedDate = completedDate
      ? new Date(completedDate)
      : new Date();

    await this.em.persistAndFlush(sessionToUpdate);
    return this.mapToDto(sessionToUpdate);
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.em.findOne(
      Session,
      { id },
      { populate: ['athletes'] }
    );
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    for (const athleteLink of session.athletes) {
      await this.em.removeAndFlush(athleteLink);
    }

    await this.em.removeAndFlush(session);
  }

  private mapToDto(session: Session): SessionDto {
    const athletes = session.athletes.getItems().map((link) => ({
      id: link.athlete.id,
      firstName: link.athlete.firstName,
      lastName: link.athlete.lastName,
      birthday: link.athlete.birthday,
      country: link.athlete.country,
      clubId: link.athlete.club?.id,
      userId: link.athlete.user?.id,
      createdAt: link.athlete.createdAt,
      updatedAt: link.athlete.updatedAt,
    }));

    const athleteSessions = session.athletes.getItems().map((link) => ({
      athleteId: link.athlete.id,
      sessionId: link.session.id,
      notes_athlete: link.notes_athlete,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    return {
      id: session.id,
      workout: {
        id: session.workout.id,
        title: session.workout.title,
        description: session.workout.description,
        workoutCategory: session.workout.category.id,
        elements: [],
      },
      athletes,
      athleteSessions,
      scheduledDate: session.scheduledDate,
      completedDate: session.completedDate,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
