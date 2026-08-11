export abstract class AthleteApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AthleteNotFoundError extends AthleteApplicationError {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}

export class AthleteAccessDeniedError extends AthleteApplicationError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class UserNotFoundError extends AthleteApplicationError {
  constructor(message = 'User not found') {
    super(message, 404);
  }
}

export class AthleteAlreadyExistsError extends AthleteApplicationError {
  constructor(message = 'User already has an athlete profile') {
    super(message, 400);
  }
}

export class InvalidAthleteCreationError extends AthleteApplicationError {
  constructor(message = 'Invalid athlete creation') {
    super(message, 400);
  }
}

export class AthleteCreationFailedError extends AthleteApplicationError {
  constructor(message = 'Athlete creation failed') {
    super(message, 500);
  }
}

export class InvalidAthleteStateError extends AthleteApplicationError {
  constructor(message = 'Invalid athlete state') {
    super(message, 400);
  }
}

export class UserDoesNotBelongToOrganizationError extends AthleteApplicationError {
  constructor(message = 'User does not belong to this organization') {
    super(message, 403);
  }
}
