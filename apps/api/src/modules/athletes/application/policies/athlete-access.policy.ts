import {
  IAthleteAccessPolicy,
  type AssertCanManageOwnAthleteParams,
  type AssertCanViewAthleteParams,
} from './athlete-access-policy.interface';
import { IOrganizationMembership } from '../ports/out/organization-membership.port';
import {
  AthleteAccessDeniedError,
  UserDoesNotBelongToOrganizationError,
} from '../errors/athlete.errors';
import type {
  OrganizationId,
  UserId,
} from '../../../../shared/kernel/identity';

export class AthleteAccessPolicy implements IAthleteAccessPolicy {
  constructor(
    private readonly organizationMembership: IOrganizationMembership
  ) {}

  async assertCanViewAthlete(
    params: AssertCanViewAthleteParams
  ): Promise<void> {
    const [isCoach, isAthleteInOrganization] = await Promise.all([
      this.organizationMembership.isCoach(
        params.currentUserId,
        params.organizationId
      ),
      this.organizationMembership.isAthlete(
        params.athleteUserId,
        params.organizationId
      ),
    ]);

    if (!isAthleteInOrganization) {
      throw new UserDoesNotBelongToOrganizationError(
        params.currentUserId,
        params.organizationId
      );
    }

    if (!isCoach && params.currentUserId !== params.athleteUserId) {
      throw new AthleteAccessDeniedError(
        params.currentUserId,
        params.athleteUserId
      );
    }
  }

  async assertCanManageAthleteData(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void> {
    const isCoach = await this.organizationMembership.isCoach(
      currentUserId,
      organizationId
    );

    if (!isCoach) {
      throw new AthleteAccessDeniedError(currentUserId);
    }
  }

  async assertAthleteBelongsToOrganization(
    athleteUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void> {
    const isAthleteInOrganization = await this.organizationMembership.isAthlete(
      athleteUserId,
      organizationId
    );

    if (!isAthleteInOrganization) {
      throw new UserDoesNotBelongToOrganizationError(
        athleteUserId,
        organizationId
      );
    }
  }

  assertCanManageOwnAthlete(params: AssertCanManageOwnAthleteParams): void {
    if (params.currentUserId !== params.athleteUserId) {
      throw new AthleteAccessDeniedError(
        params.currentUserId,
        params.athleteUserId
      );
    }
  }
}
