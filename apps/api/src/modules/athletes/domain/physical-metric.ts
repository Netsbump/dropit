import type { AthleteId } from './athlete-id';
import type { PhysicalMetricId } from './physical-metric-id';

export type PhysicalMetricCreation = {
  id: PhysicalMetricId;
  athleteId: AthleteId;
  weight?: number | null;
  height?: number | null;
  date?: Date | null;
};

export type PhysicalMetricSnapshot = {
  id: PhysicalMetricId;
  athleteId: AthleteId;
  weight: number | null;
  height: number | null;
  date: Date;
};

export type PhysicalMetricUpdate = {
  weight?: number | null;
  height?: number | null;
  date?: Date | null;
};

export abstract class PhysicalMetricDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PhysicalMetricAthleteIdIsRequiredError extends PhysicalMetricDomainError {}
export class PhysicalMetricWeightMustBePositiveError extends PhysicalMetricDomainError {}
export class PhysicalMetricHeightMustBePositiveError extends PhysicalMetricDomainError {}
export class PhysicalMetricValueIsRequiredError extends PhysicalMetricDomainError {}
export class PhysicalMetricDateMustBeValidError extends PhysicalMetricDomainError {}

export class PhysicalMetric {
  private constructor(
    public readonly id: PhysicalMetricId,
    public readonly athleteId: AthleteId,
    public readonly weight: number | null,
    public readonly height: number | null,
    public readonly date: Date
  ) {}

  static create(creation: PhysicalMetricCreation): PhysicalMetric {
    return PhysicalMetric.build({
      id: creation.id,
      athleteId: creation.athleteId,
      weight: creation.weight ?? null,
      height: creation.height ?? null,
      date: creation.date ?? new Date(),
    });
  }

  static reconstitute(snapshot: PhysicalMetricSnapshot): PhysicalMetric {
    return PhysicalMetric.build(snapshot);
  }

  amend(changes: PhysicalMetricUpdate): PhysicalMetric {
    return PhysicalMetric.build({
      id: this.id,
      athleteId: this.athleteId,
      weight: changes.weight !== undefined ? changes.weight : this.weight,
      height: changes.height !== undefined ? changes.height : this.height,
      date: changes.date ?? this.date,
    });
  }

  private static build(snapshot: PhysicalMetricSnapshot): PhysicalMetric {
    if (!snapshot.athleteId.trim()) {
      throw new PhysicalMetricAthleteIdIsRequiredError(
        'Athlete id is required'
      );
    }

    if (snapshot.weight !== null && snapshot.weight <= 0) {
      throw new PhysicalMetricWeightMustBePositiveError(
        'Weight must be positive'
      );
    }

    if (snapshot.height !== null && snapshot.height <= 0) {
      throw new PhysicalMetricHeightMustBePositiveError(
        'Height must be positive'
      );
    }

    if (snapshot.weight === null && snapshot.height === null) {
      throw new PhysicalMetricValueIsRequiredError(
        'At least one physical metric value is required'
      );
    }

    if (Number.isNaN(snapshot.date.getTime())) {
      throw new PhysicalMetricDateMustBeValidError('Date must be valid');
    }

    return new PhysicalMetric(
      snapshot.id,
      snapshot.athleteId,
      snapshot.weight,
      snapshot.height,
      snapshot.date
    );
  }
}
