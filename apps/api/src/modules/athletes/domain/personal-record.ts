export type PersonalRecordExercise = {
  id: string;
  name: string;
};

export type PersonalRecordCreation = {
  athleteId: string;
  exercise: PersonalRecordExercise;
  weight: number;
  date?: Date | null;
};

export type PersonalRecordUpdate = {
  weight?: number;
  date?: Date | null;
};

export type PersonalRecordData = PersonalRecordCreation & {
  id?: string | null;
};

export abstract class PersonalRecordDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidPersonalRecordError extends PersonalRecordDomainError {}

export class PersonalRecord {
  public readonly id: string | null;
  public readonly athleteId: string;
  public readonly exercise: PersonalRecordExercise;
  public readonly weight: number;
  public readonly date: Date;

  constructor(params: PersonalRecordData) {
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
}
