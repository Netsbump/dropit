export class CompetitorStatusException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CompetitorStatusNotFoundException extends CompetitorStatusException {
  constructor(message = 'Competitor status not found') {
    super(message, 404);
  }
}

export class CompetitorStatusAccessDeniedException extends CompetitorStatusException {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class AthleteNotFoundException extends CompetitorStatusException {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}

export class NoAthletesFoundException extends CompetitorStatusException {
  constructor(message = 'No athletes found in the organization') {
    super(message, 404);
  }
}
