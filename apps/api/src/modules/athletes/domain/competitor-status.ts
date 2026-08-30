import type { AthleteId } from './athlete-id';
import type { CompetitorStatusId } from './competitor-status-id';

export enum CompetitorLevel {
  ROOKIE = 'rookie',
  REGIONAL = 'regional',
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
  ELITE = 'elite',
}

export enum SexCategory {
  MEN = 'men',
  WOMEN = 'women',
}

export type CompetitorStatusCreation = {
  id: CompetitorStatusId;
  athleteId: AthleteId;
  level: CompetitorLevel;
  sexCategory: SexCategory;
  weightCategory?: number | null;
  endDate?: Date | null;
};

export type CompetitorStatusSnapshot = {
  id: CompetitorStatusId;
  athleteId: AthleteId;
  level: CompetitorLevel;
  sexCategory: SexCategory;
  weightCategory: number | null;
  endDate: Date | null;
};

export type CompetitorStatusUpdate = {
  level?: CompetitorLevel;
  sexCategory?: SexCategory;
  weightCategory?: number | null;
  endDate?: Date | null;
};

export abstract class CompetitorStatusDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CompetitorStatusAthleteIdIsRequiredError extends CompetitorStatusDomainError {}
export class WeightCategoryMustBePositiveError extends CompetitorStatusDomainError {}
export class EndDateMustBeValidError extends CompetitorStatusDomainError {}

export class CompetitorStatus {
  private constructor(
    public readonly id: CompetitorStatusId,
    public readonly athleteId: AthleteId,
    public readonly level: CompetitorLevel,
    public readonly sexCategory: SexCategory,
    public readonly weightCategory: number | null,
    public readonly endDate: Date | null
  ) {}

  static create(creation: CompetitorStatusCreation): CompetitorStatus {
    return CompetitorStatus.build({
      id: creation.id,
      athleteId: creation.athleteId,
      level: creation.level,
      sexCategory: creation.sexCategory,
      weightCategory: creation.weightCategory ?? null,
      endDate: creation.endDate ?? null,
    });
  }

  static reconstitute(snapshot: CompetitorStatusSnapshot): CompetitorStatus {
    return CompetitorStatus.build(snapshot);
  }

  close(endDate = new Date()): CompetitorStatus {
    return CompetitorStatus.build({
      id: this.id,
      athleteId: this.athleteId,
      level: this.level,
      sexCategory: this.sexCategory,
      weightCategory: this.weightCategory,
      endDate,
    });
  }

  amend(changes: CompetitorStatusUpdate): CompetitorStatus {
    return CompetitorStatus.build({
      id: this.id,
      athleteId: this.athleteId,
      level: changes.level ?? this.level,
      sexCategory: changes.sexCategory ?? this.sexCategory,
      weightCategory:
        changes.weightCategory !== undefined
          ? changes.weightCategory
          : this.weightCategory,
      endDate: changes.endDate !== undefined ? changes.endDate : this.endDate,
    });
  }

  private static build(snapshot: CompetitorStatusSnapshot): CompetitorStatus {
    if (!snapshot.athleteId.trim()) {
      throw new CompetitorStatusAthleteIdIsRequiredError(
        'Athlete id is required'
      );
    }

    if (snapshot.weightCategory !== null && snapshot.weightCategory <= 0) {
      throw new WeightCategoryMustBePositiveError(
        'Weight category must be positive'
      );
    }

    if (snapshot.endDate && Number.isNaN(snapshot.endDate.getTime())) {
      throw new EndDateMustBeValidError('End date must be valid');
    }

    return new CompetitorStatus(
      snapshot.id,
      snapshot.athleteId,
      snapshot.level,
      snapshot.sexCategory,
      snapshot.weightCategory,
      snapshot.endDate
    );
  }
}
