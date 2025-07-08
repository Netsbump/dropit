import {
  AthleteTrainingSessionDto,
  CreateAthleteTrainingSession,
  UpdateAthleteTrainingSession,
} from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../../members/athlete/domain/athlete.entity';
import { TrainingSession } from '../../training-session/domain/training-session.entity';
import { AthleteTrainingSession } from '../domain/athlete-training-session.entity';
import { AthleteTrainingSessionPresenter } from '../interface/athlete-training-session.presenter';
import { AthleteTrainingSessionRepository } from './athlete-training-session.repository';
import { OrganizationService } from '../../../members/organization/organization.service';

@Injectable()
export class AthleteTrainingSessionUseCases {
  constructor(
    private readonly em: EntityManager,
    private readonly athleteTrainingSessionRepository: AthleteTrainingSessionRepository,
    private readonly organizationService: OrganizationService,
  ) {}

  async getAllAthleteTrainingSessions(organizationId: string): Promise<AthleteTrainingSessionDto[]> {

   //1. Validate organization
   const organization = await this.organizationService.getOrganizationById(organizationId);

   //2. Get athletes ids from organization
   const athleteUserIds = await this.organizationService.getAthleteUserIds(organization.id);

   //3. Get athleteTrainingSessions from repository
   const athleteTrainingSessions = await this.athleteTrainingSessionRepository.getAll(athleteUserIds);

    if (!athleteTrainingSessions) {
      throw new NotFoundException('AthleteTrainingSessions not found');
    }

    return AthleteTrainingSessionPresenter.toDtoList(athleteTrainingSessions);
  }

  async getOneAthleteTrainingSession(
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
    return AthleteTrainingSessionPresenter.toDto(athleteSession);
  }

  async getAthleteTrainingSessionsByAthlete(
    athleteId: string
  ): Promise<AthleteTrainingSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteTrainingSession,
      { athlete: { id: athleteId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    return AthleteTrainingSessionPresenter.toDtoList(athleteSessions);
  }

  async getAthleteTrainingSessionsBySession(
    sessionId: string
  ): Promise<AthleteTrainingSessionDto[]> {
    const athleteSessions = await this.em.find(
      AthleteTrainingSession,
      { trainingSession: { id: sessionId } },
      { populate: ['athlete', 'trainingSession'] }
    );
    return AthleteTrainingSessionPresenter.toDtoList(athleteSessions);
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
    return AthleteTrainingSessionPresenter.toDto(athleteTrainingSessionToCreate);
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
    return AthleteTrainingSessionPresenter.toDto(athleteTrainingSessionToUpdate);
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
}
