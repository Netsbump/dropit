import type {
  CompetitorStatusDto,
  CreateCompetitorStatusInput,
} from '@dropit/schemas';
import { parseAthleteId } from '../../domain/athlete-id';
import {
  CompetitorStatus,
  type CompetitorStatusCreation,
} from '../../domain/competitor-status';
import { generateCompetitorStatusId } from '../../domain/competitor-status-id';

export const toCompetitorStatusCreation = (
  input: CreateCompetitorStatusInput,
  athleteId: string
): CompetitorStatusCreation => ({
  id: generateCompetitorStatusId(),
  athleteId: parseAthleteId(athleteId),
  level: input.level,
  sexCategory: input.sexCategory,
  weightCategory: input.weightCategory,
  endDate: null,
});

export const toCompetitorStatusDto = (
  competitorStatus: CompetitorStatus
): CompetitorStatusDto => {
  if (!competitorStatus.id) {
    throw new Error(
      'Competitor status id is required to map CompetitorStatusDto'
    );
  }

  return {
    id: competitorStatus.id,
    level: competitorStatus.level,
    sexCategory: competitorStatus.sexCategory,
    weightCategory: competitorStatus.weightCategory ?? 0,
    endDate: competitorStatus.endDate
      ? competitorStatus.endDate.toISOString()
      : null,
  };
};

export const toCompetitorStatusDtoList = (
  competitorStatuses: CompetitorStatus[]
): CompetitorStatusDto[] => competitorStatuses.map(toCompetitorStatusDto);
