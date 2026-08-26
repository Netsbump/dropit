export class InvalidPhysicalMetricIdError extends Error {
  constructor(value: string) {
    super(`Invalid physical metric id: ${value}`);
    this.name = 'InvalidPhysicalMetricIdError';
  }
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PhysicalMetricId = string & {
  readonly __brand: 'PhysicalMetricId';
};

export function parsePhysicalMetricId(value: string): PhysicalMetricId {
  if (!uuidRegex.test(value)) {
    throw new InvalidPhysicalMetricIdError(value);
  }

  return value as PhysicalMetricId;
}
