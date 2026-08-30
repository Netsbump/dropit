import type { AthleteId } from './athlete-id';
import { PersonalRecordExercise } from './personal-record-exercise';
import type { PersonalRecordId } from './personal-record-id';

export type PersonalRecordCreation = {
  id: PersonalRecordId;
  athleteId: AthleteId;
  exercise: PersonalRecordExercise;
  weight: number;
  date?: Date | null;
};

export type PersonalRecordSnapshot = {
  id: PersonalRecordId;
  athleteId: AthleteId;
  exercise: PersonalRecordExercise;
  weight: number;
  date: Date;
};

export type PersonalRecordUpdate = {
  weight?: number;
  date?: Date | null;
};

export abstract class PersonalRecordDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PersonalRecordAthleteIdIsRequiredError extends PersonalRecordDomainError {}
export class PersonalRecordWeightMustBePositiveError extends PersonalRecordDomainError {}
export class PersonalRecordDateMustBeValidError extends PersonalRecordDomainError {}

export class PersonalRecord {
  private constructor(
    public readonly id: PersonalRecordId,
    public readonly athleteId: AthleteId,
    public readonly exercise: PersonalRecordExercise,
    public readonly weight: number,
    public readonly date: Date
  ) {}

  static create(creation: PersonalRecordCreation): PersonalRecord {
    return PersonalRecord.build({
      id: creation.id,
      athleteId: creation.athleteId,
      exercise: creation.exercise,
      weight: creation.weight,
      date: creation.date ?? new Date(),
    });
  }

  static reconstitute(snapshot: PersonalRecordSnapshot): PersonalRecord {
    return PersonalRecord.build(snapshot);
  }

  amend(changes: PersonalRecordUpdate): PersonalRecord {
    return PersonalRecord.build({
      id: this.id,
      athleteId: this.athleteId,
      exercise: this.exercise,
      weight: changes.weight ?? this.weight,
      date: changes.date ?? this.date,
    });
  }

  private static build(snapshot: PersonalRecordSnapshot): PersonalRecord {
    if (!snapshot.athleteId.trim()) {
      throw new PersonalRecordAthleteIdIsRequiredError(
        'Athlete id is required'
      );
    }

    const exercise = PersonalRecordExercise.create(
      snapshot.exercise.id,
      snapshot.exercise.name
    );

    if (snapshot.weight <= 0) {
      throw new PersonalRecordWeightMustBePositiveError(
        'Weight must be positive'
      );
    }

    if (Number.isNaN(snapshot.date.getTime())) {
      throw new PersonalRecordDateMustBeValidError('Date must be valid');
    }

    return new PersonalRecord(
      snapshot.id,
      snapshot.athleteId,
      exercise,
      snapshot.weight,
      snapshot.date
    );
  }
}
