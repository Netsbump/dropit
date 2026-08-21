import type { AthleteId } from './athlete-id';
import type { PersonalRecordId } from './personal-record-id';

export type PersonalRecordExercise = {
  id: string;
  name: string;
};

export type PersonalRecordCreation = {
  athleteId: AthleteId;
  exercise: PersonalRecordExercise;
  weight: number;
  date?: Date | null;
};

export type PersonalRecordUpdate = {
  weight?: number;
  date?: Date | null;
};

export type PersonalRecordProps = PersonalRecordCreation & {
  id?: PersonalRecordId | null;
};

export abstract class PersonalRecordDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidPersonalRecordError extends PersonalRecordDomainError {}

export class PersonalRecord {
  public readonly id: PersonalRecordId | null;
  public readonly athleteId: AthleteId;
  public readonly exercise: PersonalRecordExercise;
  public readonly weight: number;
  public readonly date: Date;

  constructor(params: PersonalRecordProps) {
    if (!params.athleteId.trim()) {
      throw new InvalidPersonalRecordError('Athlete id is required');
    }

    if (!params.exercise.id.trim()) {
      throw new InvalidPersonalRecordError('Exercise id is required');
    }

    if (!params.exercise.name.trim()) {
      throw new InvalidPersonalRecordError('Exercise name is required');
    }

    if (params.weight <= 0) {
      throw new InvalidPersonalRecordError('Weight must be positive');
    }

    const date = params.date ?? new Date();
    if (Number.isNaN(date.getTime())) {
      throw new InvalidPersonalRecordError('Date must be valid');
    }

    this.id = params.id ?? null;
    this.athleteId = params.athleteId;
    this.exercise = {
      id: params.exercise.id,
      name: params.exercise.name.trim(),
    };
    this.weight = params.weight;
    this.date = date;
  }

  amend(data: PersonalRecordUpdate): PersonalRecord {
    return new PersonalRecord({
      id: this.id,
      athleteId: this.athleteId,
      exercise: this.exercise,
      weight: data.weight ?? this.weight,
      date: data.date ?? this.date,
    });
  }
}
