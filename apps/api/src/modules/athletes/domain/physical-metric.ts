import type { AthleteId } from './athlete-id';
import type { PhysicalMetricId } from './physical-metric-id';

export type PhysicalMetricCreation = {
  athleteId: AthleteId;
  weight?: number | null;
  height?: number | null;
  date?: Date | null;
};

export type PhysicalMetricUpdate = {
  weight?: number | null;
  height?: number | null;
  date?: Date | null;
};

export type PhysicalMetricData = PhysicalMetricCreation & {
  id?: PhysicalMetricId | null;
};

export abstract class PhysicalMetricDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidPhysicalMetricError extends PhysicalMetricDomainError {}

export class PhysicalMetric {
  public readonly id: PhysicalMetricId | null;
  public readonly athleteId: AthleteId;
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

    if (params.weight == null && params.height == null) {
      throw new InvalidPhysicalMetricError(
        'At least one physical metric value is required'
      );
    }

    const date = params.date ?? new Date();
    if (Number.isNaN(date.getTime())) {
      throw new InvalidPhysicalMetricError('Date must be valid');
    }

    this.id = params.id ?? null;
    this.athleteId = params.athleteId;
    this.weight = params.weight ?? null;
    this.height = params.height ?? null;
    this.date = date;
  }

  amend(data: PhysicalMetricUpdate): PhysicalMetric {
    return new PhysicalMetric({
      id: this.id,
      athleteId: this.athleteId,
      weight: data.weight !== undefined ? data.weight : this.weight,
      height: data.height !== undefined ? data.height : this.height,
      date: data.date ?? this.date,
    });
  }
}
