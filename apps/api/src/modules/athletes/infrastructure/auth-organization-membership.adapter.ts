import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import { IOrganizationMembership } from '../application/ports/out/organization-membership.port';

export class OrganizationMembershipAdapter implements IOrganizationMembership {
  constructor(private readonly memberUseCases: IMemberUseCases) {}

  async isCoach(userId: string, organizationId: string): Promise<boolean> {
    return await this.memberUseCases.isUserCoachInOrganization(
      userId,
      organizationId
    );
  }

  async isAthlete(userId: string, organizationId: string): Promise<boolean> {
    return await this.memberUseCases.isUserAthleteInOrganization(
      userId,
      organizationId
    );
  }

  async listAthleteUserIds(organizationId: string): Promise<string[]> {
    return await this.memberUseCases.listAthleteUserIds(organizationId);
  }
}
