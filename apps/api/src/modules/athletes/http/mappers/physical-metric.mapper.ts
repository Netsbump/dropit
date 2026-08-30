import type {
  CreatePhysicalMetricInput,
  PhysicalMetricDto,
} from '@dropit/schemas';
import { parseAthleteId } from '../../domain/athlete-id';
import {
  PhysicalMetric,
  type PhysicalMetricCreation,
} from '../../domain/physical-metric';
import { generatePhysicalMetricId } from '../../domain/physical-metric-id';

export const toPhysicalMetricCreation = (
  input: CreatePhysicalMetricInput,
  athleteId: string
): PhysicalMetricCreation => ({
  id: generatePhysicalMetricId(),
  athleteId: parseAthleteId(athleteId),
  weight: input.weight,
  height: input.height,
  date: input.date,
});

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
