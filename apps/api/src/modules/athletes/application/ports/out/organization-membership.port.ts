import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';

export const ORGANIZATION_MEMBERSHIP = Symbol('ORGANIZATION_MEMBERSHIP');

export interface IOrganizationMembership {
  isCoach(userId: UserId, organizationId: OrganizationId): Promise<boolean>;
  isAthlete(userId: UserId, organizationId: OrganizationId): Promise<boolean>;
  listAthleteUserIds(organizationId: OrganizationId): Promise<UserId[]>;
}
