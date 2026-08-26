export class InvalidCompetitorStatusIdError extends Error {
  constructor(value: string) {
    super(`Invalid competitor status id: ${value}`);
    this.name = 'InvalidCompetitorStatusIdError';
  }
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CompetitorStatusId = string & {
  readonly __brand: 'CompetitorStatusId';
};

export function parseCompetitorStatusId(value: string): CompetitorStatusId {
  if (!uuidRegex.test(value)) {
    throw new InvalidCompetitorStatusIdError(value);
  }

  return value as CompetitorStatusId;
}
