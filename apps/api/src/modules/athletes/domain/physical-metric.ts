export type PhysicalMetricCreation = {
  athleteId: string;
  weight?: number | null;
  height?: number | null;
  date: Date;
};

export type PhysicalMetricUpdate = {
  weight?: number | null;
  height?: number | null;
  date?: Date;
};

export type PhysicalMetricData = PhysicalMetricCreation & {
  id?: string | null;
};

export abstract class PhysicalMetricDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidPhysicalMetricError extends PhysicalMetricDomainError {}

export class PhysicalMetric {
  public readonly id: string | null;
  public readonly athleteId: string;
  public readonly weight: number | null;
  public readonly height: number | null;
  public readonly date: Date;

  constructor(params: PhysicalMetricData) {
    if (!params.athleteId.trim()) {
      throw new InvalidPhysicalMetricError('Athlete id is required');
    }

    if (
      params.weight !== undefined &&
      params.weight !== null &&
      params.weight <= 0
    ) {
      throw new InvalidPhysicalMetricError('Weight must be positive');
    }

    if (
      params.height !== undefined &&
      params.height !== null &&
      params.height <= 0
    ) {
      throw new InvalidPhysicalMetricError('Height must be positive');
    }

    if (Number.isNaN(params.date.getTime())) {
      throw new InvalidPhysicalMetricError('Date must be valid');
    }

    this.id = params.id ?? null;
    this.athleteId = params.athleteId;
    this.weight = params.weight ?? null;
    this.height = params.height ?? null;
    this.date = params.date;
  }
}
