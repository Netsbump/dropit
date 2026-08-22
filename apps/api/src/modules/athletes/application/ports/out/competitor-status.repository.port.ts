import { CompetitorStatus } from '../../../domain/competitor-status';
import type { AthleteId } from '../../../domain/athlete-id';
import type { CompetitorStatusId } from '../../../domain/competitor-status-id';

export const COMPETITOR_STATUS_REPO = Symbol('COMPETITOR_STATUS_REPO');

export interface ICompetitorStatusRepository {
  findById(id: CompetitorStatusId): Promise<CompetitorStatus | null>;
  findActiveByAthleteId(athleteId: AthleteId): Promise<CompetitorStatus | null>;
  listByAthleteUserIds(athleteUserIds: string[]): Promise<CompetitorStatus[]>;
  save(competitorStatus: CompetitorStatus): Promise<CompetitorStatus>;
  remove(competitorStatus: CompetitorStatus): Promise<void>;
}
