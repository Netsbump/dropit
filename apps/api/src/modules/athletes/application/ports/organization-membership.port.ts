export const ORGANIZATION_MEMBERSHIP = Symbol('ORGANIZATION_MEMBERSHIP');

export interface IOrganizationMembership {
  isCoach(userId: string, organizationId: string): Promise<boolean>;
  isAthlete(userId: string, organizationId: string): Promise<boolean>;
  listAthleteUserIds(organizationId: string): Promise<string[]>;
}
