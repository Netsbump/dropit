import { type Uuid, createUuid, parseUuid } from '../../../shared/kernel/uuid';

export class InvalidCompetitorStatusIdError extends Error {
  constructor(value: string) {
    super(`Invalid competitor status id: ${value}`);
    this.name = 'InvalidCompetitorStatusIdError';
  }
}

export type CompetitorStatusId = Uuid & {
  readonly __brand: 'CompetitorStatusId';
};

export function parseCompetitorStatusId(value: string): CompetitorStatusId {
  try {
    return parseUuid(value) as CompetitorStatusId;
  } catch {
    throw new InvalidCompetitorStatusIdError(value);
  }
}

export function createCompetitorStatusId(): CompetitorStatusId {
  return createUuid() as CompetitorStatusId;
}
