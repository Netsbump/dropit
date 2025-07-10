import { Injectable } from "@nestjs/common";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { CompetitorStatus } from "../domain/competitor-status.entity";
import { CompetitorStatusRepository } from "../application/ports/competitor-status.repository";

@Injectable()
export class MikroCompetitorStatusRepository extends EntityRepository<CompetitorStatus> implements CompetitorStatusRepository {
  constructor(public readonly em: EntityManager) {
    super(em, CompetitorStatus);
  }

  async getAll(athleteUserIds: string[]): Promise<CompetitorStatus[]> {
    return await this.em.find(CompetitorStatus, { 
      athlete: { 
        user: { id: { $in: athleteUserIds } } 
      } 
    }, { populate: ['athlete'] });
  }

  async getOne(athleteId: string): Promise<CompetitorStatus | null> {
    return this.em.findOne(CompetitorStatus, { athlete: { id: athleteId } }, { populate: ['athlete'] });
  }

  async save(competitorStatus: CompetitorStatus): Promise<void> {
    return this.em.persistAndFlush(competitorStatus);
  }

  async remove(competitorStatus: CompetitorStatus): Promise<void> {
    return this.em.removeAndFlush(competitorStatus);
  }
}