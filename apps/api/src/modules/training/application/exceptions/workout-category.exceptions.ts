export class WorkoutCategoryException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WorkoutCategoryNotFoundException extends WorkoutCategoryException {
  constructor(message = 'Workout category not found or access denied') {
    super(message, 404);
  }
}

export class WorkoutCategoryAccessDeniedException extends WorkoutCategoryException {
  constructor(message = 'User is not a coach of this organization') {
    super(message, 403);
  }
}

export class WorkoutCategoryValidationException extends WorkoutCategoryException {
  constructor(message = 'Workout category name is required') {
    super(message, 400);
  }
}
