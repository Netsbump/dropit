import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { AthleteTrainingSession } from "../domain/athlete-training-session.entity";
import { IAthleteTrainingSessionRepository } from "../application/ports/athlete-training-session.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroAthleteTrainingSessionRepository extends EntityRepository<AthleteTrainingSession> implements IAthleteTrainingSessionRepository {
  constructor(public readonly em: EntityManager) {
    super(em, AthleteTrainingSession);
  }
  async getAllWithDetails(athleteId: string): Promise<AthleteTrainingSession[]> {
    return await this.em.find(AthleteTrainingSession, { athlete: { id:athleteId } }, { populate: ['athlete', 'trainingSession'] });
  }

  async getOneWithDetails(athleteId: string, trainingSessionId: string): Promise<AthleteTrainingSession | null> {
    return await this.em.findOne(AthleteTrainingSession, { athlete: { id: athleteId }, trainingSession: { id: trainingSessionId } }, { populate: ['athlete', 'trainingSession'] });
  }

  async save(athleteTrainingSession: AthleteTrainingSession): Promise<void> {
    return await this.em.persistAndFlush(athleteTrainingSession);
  }

  async remove(athleteTrainingSession: AthleteTrainingSession): Promise<void> {
    return await this.em.removeAndFlush(athleteTrainingSession);
  }
}