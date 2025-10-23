export class ComplexCategoryException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ComplexCategoryNotFoundException extends ComplexCategoryException {
  constructor(message = 'Complex category not found or access denied') {
    super(message, 404);
  }
}

export class ComplexCategoryAccessDeniedException extends ComplexCategoryException {
  constructor(message = 'User is not coach of this organization') {
    super(message, 403);
  }
}

export class ComplexCategoryValidationException extends ComplexCategoryException {
  constructor(message = 'Complex category name is required') {
    super(message, 400);
  }
}
