import { type Uuid, generateUuid, parseUuid } from '../../../shared/utils/uuid';

export type PhysicalMetricId = Uuid & {
  readonly __brand: 'PhysicalMetricId';
};

export function parsePhysicalMetricId(value: string): PhysicalMetricId {
  return parseUuid(value) as PhysicalMetricId;
}

export function generatePhysicalMetricId(): PhysicalMetricId {
  return generateUuid() as PhysicalMetricId;
}
