import type {
  OrganizationId,
  UserId,
} from '../../../../shared/kernel/identity';

export const ATHLETE_ACCESS_POLICY = Symbol('ATHLETE_ACCESS_POLICY');

export type AssertCanViewAthleteParams = {
  currentUserId: UserId;
  organizationId: OrganizationId;
  athleteUserId: UserId;
};

export type AssertCanManageOwnAthleteParams = {
  currentUserId: UserId;
  athleteUserId: UserId;
};

export interface IAthleteAccessPolicy {
  assertCanViewAthlete(params: AssertCanViewAthleteParams): Promise<void>;
  assertCanManageAthleteData(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void>;
  assertAthleteBelongsToOrganization(
    athleteUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void>;
  assertCanManageOwnAthlete(params: AssertCanManageOwnAthleteParams): void;
}
