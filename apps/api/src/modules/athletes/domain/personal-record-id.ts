export class InvalidPersonalRecordIdError extends Error {
  constructor(value: string) {
    super(`Invalid personal record id: ${value}`);
    this.name = 'InvalidPersonalRecordIdError';
  }
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type PersonalRecordId = string & {
  readonly __brand: 'PersonalRecordId';
};

export function parsePersonalRecordId(value: string): PersonalRecordId {
  if (!uuidRegex.test(value)) {
    throw new InvalidPersonalRecordIdError(value);
  }

  return value as PersonalRecordId;
}
