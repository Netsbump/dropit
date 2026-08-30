import type { UserId } from '../../../shared/kernel/identity';
import type { AthleteId } from './athlete-id';

export type AthleteCreation = {
  id: AthleteId;
  userId: UserId;
  firstName: string;
  lastName: string;
  birthday?: Date | null;
  country?: string | null;
};

export type AthleteSnapshot = {
  id: AthleteId;
  userId: UserId;
  firstName: string;
  lastName: string;
  birthday: Date | null;
  country: string | null;
};

export type AthleteUpdate = {
  firstName?: string;
  lastName?: string;
  birthday?: Date | null;
  country?: string | null;
};

export abstract class AthleteDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LastNameIsRequiredError extends AthleteDomainError {}
export class FirstNameIsRequiredError extends AthleteDomainError {}
export class BirthDateCannotBeInFutureError extends AthleteDomainError {}

export class Athlete {
  private constructor(
    public readonly id: AthleteId,
    public readonly userId: UserId,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly birthday: Date | null,
    public readonly country: string | null
  ) {}

  static create(creation: AthleteCreation): Athlete {
    return Athlete.build({
      id: creation.id,
      userId: creation.userId,
      firstName: creation.firstName,
      lastName: creation.lastName,
      birthday: creation.birthday ?? null,
      country: creation.country ?? null,
    });
  }

  static reconstitute(snapshot: AthleteSnapshot): Athlete {
    return Athlete.build(snapshot);
  }

  update(changes: AthleteUpdate): Athlete {
    return Athlete.build({
      id: this.id,
      userId: this.userId,
      firstName: changes.firstName ?? this.firstName,
      lastName: changes.lastName ?? this.lastName,
      birthday:
        changes.birthday !== undefined ? changes.birthday : this.birthday,
      country: changes.country !== undefined ? changes.country : this.country,
    });
  }

  private static build(snapshot: AthleteSnapshot): Athlete {
    const firstName = snapshot.firstName.trim();
    const lastName = snapshot.lastName.trim();

    if (!firstName) {
      throw new FirstNameIsRequiredError('First name is required');
    }

    if (!lastName) {
      throw new LastNameIsRequiredError('Last name is required');
    }

    if (
      snapshot.birthday !== null &&
      snapshot.birthday.getTime() > Date.now()
    ) {
      throw new BirthDateCannotBeInFutureError(
        'Birth date cannot be in the future'
      );
    }

    return new Athlete(
      snapshot.id,
      snapshot.userId,
      firstName,
      lastName,
      snapshot.birthday,
      snapshot.country
    );
  }
}
