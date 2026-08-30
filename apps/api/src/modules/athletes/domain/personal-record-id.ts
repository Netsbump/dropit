import { type Uuid, generateUuid, parseUuid } from '../../../shared/utils/uuid';

export type PersonalRecordId = Uuid & {
  readonly __brand: 'PersonalRecordId';
};

export function parsePersonalRecordId(value: string): PersonalRecordId {
  return parseUuid(value) as PersonalRecordId;
}

export function generatePersonalRecordId(): PersonalRecordId {
  return generateUuid() as PersonalRecordId;
}
