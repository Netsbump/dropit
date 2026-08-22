import { isUuid } from './uuid';

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

export type UserId = string & { readonly __brand: 'UserId' };

export type OrganizationId = string & { readonly __brand: 'OrganizationId' };

export function parseUserId(value: string): UserId {
  if (!isUuid(value)) {
    throw new InvalidUserIdError(value);
  }

  return value as UserId;
}

export function parseOrganizationId(value: string): OrganizationId {
  if (!isUuid(value)) {
    throw new InvalidOrganizationIdError(value);
  }

  return value as OrganizationId;
}
