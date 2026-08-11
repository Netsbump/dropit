import { IMemberUseCases } from '../../../auth/application/ports/member-use-cases.port';
import {
  AthleteAccessDeniedError,
  UserDoesNotBelongToOrganizationError,
} from '../errors/athlete.errors';

type AssertCanViewAthleteParams = {
  currentUserId: string;
  organizationId: string;
  athleteUserId: string;
};

type AssertCanManageOwnAthleteParams = {
  currentUserId: string;
  athleteUserId: string;
};

export class AthleteAccessPolicy {
  constructor(private readonly memberUseCases: IMemberUseCases) {}

  async assertCanViewAthlete(
    params: AssertCanViewAthleteParams
  ): Promise<void> {
    const [isCoach, isAthleteInOrganization] = await Promise.all([
      this.memberUseCases.isUserCoachInOrganization(
        params.currentUserId,
        params.organizationId
      ),
      this.memberUseCases.isUserAthleteInOrganization(
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

  assertCanManageOwnAthlete(params: AssertCanManageOwnAthleteParams): void {
    if (params.currentUserId !== params.athleteUserId) {
      throw new AthleteAccessDeniedError('Athlete does not belong to User');
    }
  }
}
