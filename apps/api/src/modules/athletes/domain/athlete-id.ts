import {
  type Uuid,
  generateUuid,
  parseUuid,
} from '../../../shared/kernel/uuid';

export type AthleteId = Uuid & { readonly __brand: 'AthleteId' };

export function parseAthleteId(value: string): AthleteId {
  return parseUuid(value) as AthleteId;
}

export function generateAthleteId(): AthleteId {
  return generateUuid() as AthleteId;
}
