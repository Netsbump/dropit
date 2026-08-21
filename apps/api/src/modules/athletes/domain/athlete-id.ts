export class InvalidAthleteIdError extends Error {
  constructor(value: string) {
    super(`Invalid athlete id: ${value}`);
    this.name = 'InvalidAthleteIdError';
  }
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type AthleteId = string & { readonly __brand: 'AthleteId' };

export function parseAthleteId(value: string): AthleteId {
  if (!uuidRegex.test(value)) {
    throw new InvalidAthleteIdError(value);
  }

  return value as AthleteId;
}
