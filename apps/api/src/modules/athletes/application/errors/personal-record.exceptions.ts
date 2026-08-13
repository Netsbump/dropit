export class PersonalRecordException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PersonalRecordNotFoundException extends PersonalRecordException {
  constructor(message = 'Personal record not found') {
    super(message, 404);
  }
}

export class AthleteNotFoundException extends PersonalRecordException {
  constructor(message = 'Athlete not found') {
    super(message, 404);
  }
}

export class ExerciseNotFoundException extends PersonalRecordException {
  constructor(message = 'Exercise not found') {
    super(message, 404);
  }
}

export class InvalidPersonalRecordException extends PersonalRecordException {
  constructor(message = 'Invalid personal record') {
    super(message, 400);
  }
}

export class NoAthletesFoundException extends PersonalRecordException {
  constructor(message = 'No athletes found') {
    super(message, 404);
  }
}

export class NoPersonalRecordsFoundException extends PersonalRecordException {
  constructor(message = 'No personal records found') {
    super(message, 404);
  }
}
