import { PhysicalMetricEntity } from '../../../database/entities/physical-metric.entity';
import { parseAthleteId } from '../../domain/athlete-id';
import { PhysicalMetric } from '../../domain/physical-metric';
import { parsePhysicalMetricId } from '../../domain/physical-metric-id';

export const toPhysicalMetricDomain = (
  entity: PhysicalMetricEntity
): PhysicalMetric => {
  return new PhysicalMetric({
    id: parsePhysicalMetricId(entity.id),
    athleteId: parseAthleteId(entity.athlete.id),
    weight: entity.weight,
    height: entity.height,
    date: entity.date,
  });
};

export const toPhysicalMetricDomainList = (
  entities: PhysicalMetricEntity[]
): PhysicalMetric[] => entities.map(toPhysicalMetricDomain);
