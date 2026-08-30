import { CompetitorStatusEntity } from '../../../database/entities/competitor-status.entity';
import { CompetitorStatus } from '../../domain/competitor-status';
import { parseAthleteId } from '../../domain/athlete-id';
import { parseCompetitorStatusId } from '../../domain/competitor-status-id';

export const toCompetitorStatusDomain = (
  entity: CompetitorStatusEntity
): CompetitorStatus => {
  return CompetitorStatus.reconstitute({
    id: parseCompetitorStatusId(entity.id),
    athleteId: parseAthleteId(entity.athlete.id),
    level: entity.level,
    sexCategory: entity.sexCategory,
    weightCategory: entity.weightCategory,
    endDate: entity.endDate,
  });
};

export const toCompetitorStatusDomainList = (
  entities: CompetitorStatusEntity[]
): CompetitorStatus[] => entities.map(toCompetitorStatusDomain);
