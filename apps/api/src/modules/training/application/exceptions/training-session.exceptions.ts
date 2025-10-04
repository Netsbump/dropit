export class TrainingSessionException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TrainingSessionNotFoundException extends TrainingSessionException {
  constructor(message = 'Training session not found') {
    super(message, 404);
  }
}

export class TrainingSessionAccessDeniedException extends TrainingSessionException {
  constructor(message = 'User is not authorized to access this resource') {
    super(message, 403);
  }
}

export class AthleteNotFoundException extends TrainingSessionException {
  constructor(message = 'Athlete not found or not associated with a user') {
    super(message, 404);
  }
}

export class WorkoutNotFoundException extends TrainingSessionException {
  constructor(message = 'Workout not found') {
    super(message, 404);
  }
}

export class AthletesNotInOrganizationException extends TrainingSessionException {
  constructor(message = 'Athletes do not belong to this organization') {
    super(message, 400);
  }
}

export class TrainingSessionValidationException extends TrainingSessionException {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}
