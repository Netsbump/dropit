import type { PhysicalMetricDto } from '@dropit/schemas';
import { PhysicalMetric } from '../../domain/physical-metric';

export const toPhysicalMetricDto = (
  physicalMetric: PhysicalMetric
): PhysicalMetricDto => {
  if (!physicalMetric.id) {
    throw new Error('Physical metric id is required to map PhysicalMetricDto');
  }

  return {
    id: physicalMetric.id,
    athleteId: physicalMetric.athleteId,
    weight: physicalMetric.weight,
    height: physicalMetric.height,
    date: physicalMetric.date,
  };
};

export const toPhysicalMetricDtoList = (
  physicalMetrics: PhysicalMetric[]
): PhysicalMetricDto[] => physicalMetrics.map(toPhysicalMetricDto);
