import { type Uuid, parseUuid } from './uuid';

export class InvalidUserIdError extends Error {
  constructor(value: string) {
    super(`Invalid user id: ${value}`);
    this.name = 'InvalidUserIdError';
  }
}

export class InvalidOrganizationIdError extends Error {
  constructor(value: string) {
    super(`Invalid organization id: ${value}`);
    this.name = 'InvalidOrganizationIdError';
  }
}

export type UserId = Uuid & { readonly __brand: 'UserId' };

export type OrganizationId = Uuid & { readonly __brand: 'OrganizationId' };

export function parseUserId(value: string): UserId {
  try {
    return parseUuid(value) as UserId;
  } catch {
    throw new InvalidUserIdError(value);
  }
}

export function parseOrganizationId(value: string): OrganizationId {
  try {
    return parseUuid(value) as OrganizationId;
  } catch {
    throw new InvalidOrganizationIdError(value);
  }
}
