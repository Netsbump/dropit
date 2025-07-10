import { CompetitorStatusDto } from '@dropit/schemas';
import { CompetitorStatus } from '../../domain/competitor-status.entity';

export const CompetitorStatusMapper = {

  toDto(competitorStatus: CompetitorStatus): CompetitorStatusDto {
    return {
      id: competitorStatus.id,
      level: competitorStatus.level,
      sexCategory: competitorStatus.sexCategory,
      weightCategory: competitorStatus.weightCategory ?? 0,
      updatedAt: competitorStatus.updatedAt.toISOString(),
      endDate: competitorStatus.endDate ? competitorStatus.endDate.toISOString() : null,
    };
  },

  toDtoList(competitorStatuses: CompetitorStatus[]): CompetitorStatusDto[] {
    return competitorStatuses.map((competitorStatus) => CompetitorStatusMapper.toDto(competitorStatus));
  },
};