export class WorkoutException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WorkoutNotFoundException extends WorkoutException {
  constructor(message = 'Workout not found') {
    super(message, 404);
  }
}

export class WorkoutAccessDeniedException extends WorkoutException {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class WorkoutValidationException extends WorkoutException {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

export class WorkoutCategoryNotFoundException extends WorkoutException {
  constructor(message = 'Workout category not found') {
    super(message, 404);
  }
}

export class ExerciseNotFoundException extends WorkoutException {
  constructor(message = 'Exercise not found') {
    super(message, 404);
  }
}

export class ComplexNotFoundException extends WorkoutException {
  constructor(message = 'Complex not found') {
    super(message, 404);
  }
}

export class AthleteNotFoundException extends WorkoutException {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}
