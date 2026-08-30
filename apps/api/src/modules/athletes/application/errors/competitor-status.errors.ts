import { NotFoundError } from '../../../../shared/application/errors/not-found.error';
import type { AthleteId } from '../../domain/athlete-id';
import type { CompetitorStatusId } from '../../domain/competitor-status-id';

export class CompetitorStatusNotFoundError extends NotFoundError {
  constructor(competitorStatusId: CompetitorStatusId) {
    super(`Competitor status with ID ${competitorStatusId} not found`);
  }
}

export class ActiveCompetitorStatusNotFoundError extends NotFoundError {
  constructor(athleteId: AthleteId) {
    super(
      `Active competitor status for athlete with ID ${athleteId} not found`
    );
  }
}
