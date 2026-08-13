import { CompetitorStatus } from '../../../domain/competitor-status';

export const COMPETITOR_STATUS_REPO = Symbol('COMPETITOR_STATUS_REPO');

export interface ICompetitorStatusRepository {
  findById(id: string): Promise<CompetitorStatus | null>;
  findActiveByAthleteId(athleteId: string): Promise<CompetitorStatus | null>;
  listByAthleteUserIds(athleteUserIds: string[]): Promise<CompetitorStatus[]>;
  save(competitorStatus: CompetitorStatus): Promise<CompetitorStatus>;
  remove(competitorStatus: CompetitorStatus): Promise<void>;
}
