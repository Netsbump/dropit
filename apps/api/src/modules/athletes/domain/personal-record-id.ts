import { type Uuid, createUuid, parseUuid } from '../../../shared/kernel/uuid';

export class InvalidPersonalRecordIdError extends Error {
  constructor(value: string) {
    super(`Invalid personal record id: ${value}`);
    this.name = 'InvalidPersonalRecordIdError';
  }
}

export type PersonalRecordId = Uuid & {
  readonly __brand: 'PersonalRecordId';
};

export function parsePersonalRecordId(value: string): PersonalRecordId {
  try {
    return parseUuid(value) as PersonalRecordId;
  } catch {
    throw new InvalidPersonalRecordIdError(value);
  }
}

export function createPersonalRecordId(): PersonalRecordId {
  return createUuid() as PersonalRecordId;
}
