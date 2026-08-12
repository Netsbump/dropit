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
        'Athlete does not belong to this organization'
      );
    }

    if (!isCoach && params.currentUserId !== params.athleteUserId) {
      throw new AthleteAccessDeniedError(
        'Access denied. You can only access your own athlete or athletes you are coaching'
      );
    }
  }

  async assertCanManageAthleteData(
    currentUserId: string,
    organizationId: string
  ): Promise<void> {
    const isCoach = await this.organizationMembership.isCoach(
      currentUserId,
      organizationId
    );

    if (!isCoach) {
      throw new AthleteAccessDeniedError(
        'Access denied. Only coaches can manage athlete data'
      );
    }
  }

  async assertAthleteBelongsToOrganization(
    athleteUserId: string,
    organizationId: string
  ): Promise<void> {
    const isAthleteInOrganization = await this.organizationMembership.isAthlete(
      athleteUserId,
      organizationId
    );

    if (!isAthleteInOrganization) {
      throw new UserDoesNotBelongToOrganizationError(
        'Athlete does not belong to this organization'
      );
    }
  }

  assertCanManageOwnAthlete(params: AssertCanManageOwnAthleteParams): void {
    if (params.currentUserId !== params.athleteUserId) {
      throw new AthleteAccessDeniedError('Athlete does not belong to User');
    }
  }
}
