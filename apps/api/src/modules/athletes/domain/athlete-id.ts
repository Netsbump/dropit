import { type Uuid, createUuid, parseUuid } from '../../../shared/kernel/uuid';

export class InvalidAthleteIdError extends Error {
  constructor(value: string) {
    super(`Invalid athlete id: ${value}`);
    this.name = 'InvalidAthleteIdError';
  }
}

export type AthleteId = Uuid & { readonly __brand: 'AthleteId' };

export function parseAthleteId(value: string): AthleteId {
  try {
    return parseUuid(value) as AthleteId;
  } catch {
    throw new InvalidAthleteIdError(value);
  }
}

export function createAthleteId(): AthleteId {
  return createUuid() as AthleteId;
}
