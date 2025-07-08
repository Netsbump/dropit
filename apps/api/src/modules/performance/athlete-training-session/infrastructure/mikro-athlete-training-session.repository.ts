import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { AthleteTrainingSession } from '../domain/athlete-training-session.entity';
import { AthleteTrainingSessionRepository } from '../application/athlete-training-session.repository';

export class MikroAthleteTrainingSessionRepository extends EntityRepository<AthleteTrainingSession> implements AthleteTrainingSessionRepository {
  constructor(public readonly em: EntityManager) {
    super(em, AthleteTrainingSession);
  }

  async save(athleteTrainingSession: AthleteTrainingSession) {
     return await this.em.persistAndFlush(athleteTrainingSession);
  }

  async ofIds(athleteId: string, trainingSessionId: string): Promise<AthleteTrainingSession | null> {
    return await this.em.findOne(AthleteTrainingSession, { athlete: { id: athleteId }, trainingSession: { id: trainingSessionId } });
  }

  async getAll(athleteUserIds: string[]): Promise<AthleteTrainingSession[]> {
    return await this.em.find(AthleteTrainingSession, { athlete: { id: { $in: athleteUserIds } } }, { populate: ['athlete', 'trainingSession'] });
  }

  async remove(athleteTrainingSession: AthleteTrainingSession) {
     return await this.em.removeAndFlush(athleteTrainingSession);
  }
}