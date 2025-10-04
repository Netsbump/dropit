export class AthleteException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AthleteNotFoundException extends AthleteException {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}

export class AthleteAccessDeniedException extends AthleteException {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class UserNotFoundException extends AthleteException {
  constructor(message = 'User not found') {
    super(message, 404);
  }
}

export class AthleteAlreadyExistsException extends AthleteException {
  constructor(message = 'User already has an athlete profile') {
    super(message, 400);
  }
}

export class AthleteValidationException extends AthleteException {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

export class UserDoesNotBelongToOrganizationException extends AthleteException {
  constructor(message = 'User does not belong to this organization') {
    super(message, 403);
  }
}
