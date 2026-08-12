import type { CompetitorStatusDto } from '@dropit/schemas';
import { CompetitorStatus } from '../../domain/competitor-status';

export const toCompetitorStatusDto = (
  competitorStatus: CompetitorStatus
): CompetitorStatusDto => {
  if (!competitorStatus.id) {
    throw new Error(
      'Competitor status id is required to map CompetitorStatusDto'
    );
  }

  return {
    id: competitorStatus.id,
    level: competitorStatus.level,
    sexCategory: competitorStatus.sexCategory,
    weightCategory: competitorStatus.weightCategory ?? 0,
    endDate: competitorStatus.endDate
      ? competitorStatus.endDate.toISOString()
      : null,
  };
};

export const toCompetitorStatusDtoList = (
  competitorStatuses: CompetitorStatus[]
): CompetitorStatusDto[] => competitorStatuses.map(toCompetitorStatusDto);
