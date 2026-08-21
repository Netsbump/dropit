export class InvalidAthleteIdError extends Error {
  constructor(value: string) {
    super(`Invalid athlete id: ${value}`);
    this.name = 'InvalidAthleteIdError';
  }
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export class AthleteId {
  constructor(public readonly value: string) {
    if (!uuidRegex.test(value)) {
      throw new InvalidAthleteIdError(value);
    }
  }

  equals(other: AthleteId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
