import { type Uuid, createUuid, parseUuid } from '../../../shared/kernel/uuid';

export class InvalidPhysicalMetricIdError extends Error {
  constructor(value: string) {
    super(`Invalid physical metric id: ${value}`);
    this.name = 'InvalidPhysicalMetricIdError';
  }
}

export type PhysicalMetricId = Uuid & {
  readonly __brand: 'PhysicalMetricId';
};

export function parsePhysicalMetricId(value: string): PhysicalMetricId {
  try {
    return parseUuid(value) as PhysicalMetricId;
  } catch {
    throw new InvalidPhysicalMetricIdError(value);
  }
}

export function createPhysicalMetricId(): PhysicalMetricId {
  return createUuid() as PhysicalMetricId;
}
