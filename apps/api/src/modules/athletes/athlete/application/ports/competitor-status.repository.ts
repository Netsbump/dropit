import { CompetitorStatus } from "../../domain/competitor-status.entity";

export const COMPETITOR_STATUS_REPO = Symbol('COMPETITOR_STATUS_REPO');

export interface ICompetitorStatusRepository {
  getAll(athleteUserIds: string[]): Promise<CompetitorStatus[]>;
  getOne(id: string): Promise<CompetitorStatus | null>;
  save(competitorStatus: CompetitorStatus): Promise<void>;
  remove(competitorStatus: CompetitorStatus): Promise<void>;
}