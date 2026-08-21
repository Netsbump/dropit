import type { AthleteId } from './athlete-id';

export type AthleteCreation = {
  userId: string;
  firstName: string;
  lastName: string;
  birthday?: Date | null;
  country?: string | null;
};

export type AthleteUpdate = {
  firstName?: string;
  lastName?: string;
  birthday?: Date | null;
  country?: string | null;
};

export type AthleteData = AthleteCreation & {
  id?: AthleteId | null;
};

export abstract class AthleteDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidAthleteError extends AthleteDomainError {}

export class Athlete {
  public readonly id: AthleteId | null;
  public readonly userId: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly birthday: Date | null;
  public readonly country: string | null;

  constructor(params: AthleteData) {
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!firstName) {
      throw new InvalidAthleteError('First name is required');
    }

    if (!lastName) {
      throw new InvalidAthleteError('Last name is required');
    }

    this.id = params.id ?? null;
    this.userId = params.userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthday = params.birthday ?? null;
    this.country = params.country ?? null;
  }
}
