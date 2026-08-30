export abstract class PersonalRecordExerciseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExerciseIdIsRequiredError extends PersonalRecordExerciseDomainError {}
export class ExerciseNameIsRequiredError extends PersonalRecordExerciseDomainError {}

export class PersonalRecordExercise {
  private constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  static create(id: string, name: string): PersonalRecordExercise {
    if (!id.trim()) {
      throw new ExerciseIdIsRequiredError('Exercise id is required');
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new ExerciseNameIsRequiredError('Exercise name is required');
    }

    return new PersonalRecordExercise(id, trimmedName);
  }
}
