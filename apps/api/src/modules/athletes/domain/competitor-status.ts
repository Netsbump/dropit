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
  athleteId: AthleteId;
  level: CompetitorLevel;
  sexCategory: SexCategory;
  weightCategory?: number | null;
  endDate?: Date | null;
};

export type CompetitorStatusUpdate = {
  level?: CompetitorLevel;
  sexCategory?: SexCategory;
  weightCategory?: number | null;
  endDate?: Date | null;
};

export type CompetitorStatusProps = CompetitorStatusCreation & {
  id?: CompetitorStatusId | null;
};

export abstract class CompetitorStatusDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCompetitorStatusError extends CompetitorStatusDomainError {}

export class CompetitorStatus {
  public readonly id: CompetitorStatusId | null;
  public readonly athleteId: AthleteId;
  public readonly level: CompetitorLevel;
  public readonly sexCategory: SexCategory;
  public readonly weightCategory: number | null;
  public readonly endDate: Date | null;

  constructor(params: CompetitorStatusProps) {
    if (!params.athleteId.trim()) {
      throw new InvalidCompetitorStatusError('Athlete id is required');
    }

    if (
      params.weightCategory !== undefined &&
      params.weightCategory !== null &&
      params.weightCategory <= 0
    ) {
      throw new InvalidCompetitorStatusError(
        'Weight category must be positive'
      );
    }

    if (params.endDate && Number.isNaN(params.endDate.getTime())) {
      throw new InvalidCompetitorStatusError('End date must be valid');
    }

    this.id = params.id ?? null;
    this.athleteId = params.athleteId;
    this.level = params.level;
    this.sexCategory = params.sexCategory;
    this.weightCategory = params.weightCategory ?? null;
    this.endDate = params.endDate ?? null;
  }

  close(endDate = new Date()): CompetitorStatus {
    return new CompetitorStatus({
      id: this.id,
      athleteId: this.athleteId,
      level: this.level,
      sexCategory: this.sexCategory,
      weightCategory: this.weightCategory,
      endDate,
    });
  }

  amend(data: CompetitorStatusUpdate): CompetitorStatus {
    return new CompetitorStatus({
      id: this.id,
      athleteId: this.athleteId,
      level: data.level ?? this.level,
      sexCategory: data.sexCategory ?? this.sexCategory,
      weightCategory:
        data.weightCategory !== undefined
          ? data.weightCategory
          : this.weightCategory,
      endDate: data.endDate !== undefined ? data.endDate : this.endDate,
    });
  }
}
