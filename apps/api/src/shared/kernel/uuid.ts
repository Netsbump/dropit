import { randomUUID } from 'node:crypto';
import { validate as isValidUuid } from 'uuid';

export class InvalidUuidError extends Error {
  constructor(value: string) {
    super(`Invalid UUID: ${value}`);
    this.name = 'InvalidUuidError';
  }
}

export type Uuid = string & { readonly __uuidBrand: 'Uuid' };

export function isUuid(value: string): value is Uuid {
  return isValidUuid(value);
}

export function parseUuid(value: string): Uuid {
  if (!isUuid(value)) {
    throw new InvalidUuidError(value);
  }

  return value;
}

export function createUuid(): Uuid {
  return randomUUID() as Uuid;
}
