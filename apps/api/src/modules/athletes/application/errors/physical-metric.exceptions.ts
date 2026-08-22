export class PhysicalMetricException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PhysicalMetricNotFoundException extends PhysicalMetricException {
  constructor(message = 'Physical metric not found') {
    super(message, 404);
  }
}

export class PhysicalMetricAthleteNotFoundException extends PhysicalMetricException {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}

export class InvalidPhysicalMetricException extends PhysicalMetricException {
  constructor(message = 'Invalid physical metric') {
    super(message, 400);
  }
}
