export class ComplexException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ComplexNotFoundException extends ComplexException {
  constructor(message = 'Complex not found or access denied') {
    super(message, 404);
  }
}

export class ComplexAccessDeniedException extends ComplexException {
  constructor(message = 'User is not coach of this organization') {
    super(message, 403);
  }
}

export class ComplexCategoryNotFoundException extends ComplexException {
  constructor(message = 'Complex category not found') {
    super(message, 404);
  }
}

export class ExerciseNotFoundException extends ComplexException {
  constructor(message = 'Exercise not found or access denied') {
    super(message, 404);
  }
}

export class ComplexValidationException extends ComplexException {
  constructor(message = 'Exercises are required') {
    super(message, 400);
  }
}

export class NoComplexesFoundException extends ComplexException {
  constructor(message = 'No complexes found') {
    super(message, 404);
  }
}
