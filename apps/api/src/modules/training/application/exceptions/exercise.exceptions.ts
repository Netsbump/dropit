export class ExerciseException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExerciseNotFoundException extends ExerciseException {
  constructor(message = 'Exercise not found') {
    super(message, 404);
  }
}

export class ExerciseAccessDeniedException extends ExerciseException {
  constructor(message = 'User is not coach of this organization') {
    super(message, 403);
  }
}

export class ExerciseCategoryNotFoundException extends ExerciseException {
  constructor(message = 'Exercise category not found') {
    super(message, 404);
  }
}

export class ExerciseValidationException extends ExerciseException {
  constructor(message = 'Exercise name is required') {
    super(message, 400);
  }
}

export class NoExercisesFoundException extends ExerciseException {
  constructor(message = 'No exercises found') {
    super(message, 404);
  }
}
