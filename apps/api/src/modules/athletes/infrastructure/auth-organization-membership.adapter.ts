import { IMemberUseCases } from '../../auth/application/ports/member-use-cases.port';
import { IOrganizationMembership } from '../application/ports/out/organization-membership.port';
import {
  parseUserId,
  type OrganizationId,
  type UserId,
} from '../../../shared/kernel/identity';

export class AuthOrganizationMembershipAdapter
  implements IOrganizationMembership
{
  constructor(private readonly memberUseCases: IMemberUseCases) {}

  async isCoach(userId: UserId, organizationId: OrganizationId): Promise<boolean> {
    return await this.memberUseCases.isUserCoachInOrganization(
      userId,
      organizationId
    );
  }

  async isAthlete(
    userId: UserId,
    organizationId: OrganizationId
  ): Promise<boolean> {
    return await this.memberUseCases.isUserAthleteInOrganization(
      userId,
      organizationId
    );
  }

  async listAthleteUserIds(organizationId: OrganizationId): Promise<UserId[]> {
    const athleteUserIds = await this.memberUseCases.listAthleteUserIds(
      organizationId
    );

    return athleteUserIds.map(parseUserId);
  }
}
