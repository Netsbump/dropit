export const ATHLETE_ACCESS_POLICY = Symbol('ATHLETE_ACCESS_POLICY');

export type AssertCanViewAthleteParams = {
  currentUserId: string;
  organizationId: string;
  athleteUserId: string;
};

export type AssertCanManageOwnAthleteParams = {
  currentUserId: string;
  athleteUserId: string;
};

export interface IAthleteAccessPolicy {
  assertCanViewAthlete(params: AssertCanViewAthleteParams): Promise<void>;
  assertCanManageAthleteData(
    currentUserId: string,
    organizationId: string
  ): Promise<void>;
  assertAthleteBelongsToOrganization(
    athleteUserId: string,
    organizationId: string
  ): Promise<void>;
  assertCanManageOwnAthlete(params: AssertCanManageOwnAthleteParams): void;
}
