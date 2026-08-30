import { type Uuid, parseUuid } from '../utils/uuid';

export type UserId = Uuid & { readonly __brand: 'UserId' };

export type OrganizationId = Uuid & { readonly __brand: 'OrganizationId' };

export function parseUserId(value: string): UserId {
  return parseUuid(value) as UserId;
}

export function parseOrganizationId(value: string): OrganizationId {
  return parseUuid(value) as OrganizationId;
}
