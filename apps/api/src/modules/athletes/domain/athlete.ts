import type { UserId } from '../../../shared/kernel/identity';
import { type AthleteId, createAthleteId } from './athlete-id';

export type AthleteCreation = {
  userId: UserId;
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

export type AthleteProps = AthleteCreation & {
  id?: AthleteId;
};

export abstract class AthleteDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidAthleteError extends AthleteDomainError {}

export class Athlete {
  public readonly id: AthleteId;
  public readonly userId: UserId;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly birthday: Date | null;
  public readonly country: string | null;

  constructor(params: AthleteProps) {
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!firstName) {
      throw new InvalidAthleteError('First name is required');
    }

    if (!lastName) {
      throw new InvalidAthleteError('Last name is required');
    }

    this.id = params.id ?? createAthleteId();
    this.userId = params.userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthday = params.birthday ?? null;
    this.country = params.country ?? null;
  }

  updateProfile(data: AthleteUpdate): Athlete {
    return new Athlete({
      id: this.id,
      userId: this.userId,
      firstName: data.firstName ?? this.firstName,
      lastName: data.lastName ?? this.lastName,
      birthday: data.birthday !== undefined ? data.birthday : this.birthday,
      country: data.country !== undefined ? data.country : this.country,
    });
  }
}
