import { type Uuid, generateUuid, parseUuid } from '../../../shared/utils/uuid';

export type CompetitorStatusId = Uuid & {
  readonly __brand: 'CompetitorStatusId';
};

export function parseCompetitorStatusId(value: string): CompetitorStatusId {
  return parseUuid(value) as CompetitorStatusId;
}

export function generateCompetitorStatusId(): CompetitorStatusId {
  return generateUuid() as CompetitorStatusId;
}
