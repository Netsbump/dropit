export class ExerciseCategoryException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExerciseCategoryNotFoundException extends ExerciseCategoryException {
  constructor(message = 'Exercise category not found or access denied') {
    super(message, 404);
  }
}

export class ExerciseCategoryAccessDeniedException extends ExerciseCategoryException {
  constructor(message = 'User is not coach of this organization') {
    super(message, 403);
  }
}

export class ExerciseCategoryValidationException extends ExerciseCategoryException {
  constructor(message = 'Exercise category name is required') {
    super(message, 400);
  }
}
