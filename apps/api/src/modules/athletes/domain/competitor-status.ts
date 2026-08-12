import { CompetitorLevel, SexCategory } from '@dropit/schemas';

export type CompetitorStatusCreation = {
  athleteId: string;
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

export type CompetitorStatusData = CompetitorStatusCreation & {
  id?: string | null;
};

export abstract class CompetitorStatusDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCompetitorStatusError extends CompetitorStatusDomainError {}

export class CompetitorStatus {
  public readonly id: string | null;
  public readonly athleteId: string;
  public readonly level: CompetitorLevel;
  public readonly sexCategory: SexCategory;
  public readonly weightCategory: number | null;
  public readonly endDate: Date | null;

  constructor(params: CompetitorStatusData) {
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
}
