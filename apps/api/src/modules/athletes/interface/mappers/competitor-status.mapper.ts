import { CompetitorStatusDto } from '@dropit/schemas';
import { CompetitorStatus } from '../../domain/competitor-status';

export const CompetitorStatusMapper = {
  toDto(competitorStatus: CompetitorStatus): CompetitorStatusDto {
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
  },

  toDtoList(competitorStatuses: CompetitorStatus[]): CompetitorStatusDto[] {
    return competitorStatuses.map((competitorStatus) =>
      CompetitorStatusMapper.toDto(competitorStatus)
    );
  },
};
