import { CompetitorStatusEntity } from '../../../database/entities/competitor-status.entity';
import { CompetitorStatus } from '../../domain/competitor-status';

export const toCompetitorStatusDomain = (
  entity: CompetitorStatusEntity
): CompetitorStatus => {
  return new CompetitorStatus({
    id: entity.id,
    athleteId: entity.athlete.id,
    level: entity.level,
    sexCategory: entity.sexCategory,
    weightCategory: entity.weightCategory,
    endDate: entity.endDate,
  });
};

export const toCompetitorStatusDomainList = (
  entities: CompetitorStatusEntity[]
): CompetitorStatus[] => entities.map(toCompetitorStatusDomain);
