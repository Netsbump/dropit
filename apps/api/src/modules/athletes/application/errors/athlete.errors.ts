import { AccessDeniedError } from '../../../../shared/application/errors/access-denied.error';
import { ConflictError } from '../../../../shared/application/errors/conflict.error';
import { NotFoundError } from '../../../../shared/application/errors/not-found.error';
import type {
  OrganizationId,
  UserId,
} from '../../../../shared/kernel/identity';
import type { AthleteId } from '../../domain/athlete-id';

export class AthleteNotFoundError extends NotFoundError {
  constructor(athleteId?: AthleteId) {
    super(athleteId ? `Athlete ${athleteId} not found` : 'Athlete not found');
  }
}

export class UserProfileNotFoundError extends NotFoundError {
  constructor(userId: UserId) {
    super(`User profile ${userId} not found`);
  }
}

export class AthleteProfileAlreadyExistsError extends ConflictError {
  constructor(userId: UserId) {
    super(`User ${userId} already has an athlete profile`);
  }
}

export class AthleteAccessDeniedError extends AccessDeniedError {
  constructor(currentUserId: UserId, athleteUserId?: UserId) {
    super(
      athleteUserId
        ? `User ${currentUserId} cannot access athlete profile owned by user ${athleteUserId}`
        : `Access denied for user ${currentUserId}`
    );
  }
}

export class UserDoesNotBelongToOrganizationError extends AccessDeniedError {
  constructor(userId: UserId, organizationId: OrganizationId) {
    super(`User ${userId} does not belong to organization ${organizationId}`);
  }
}
