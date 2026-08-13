export const ATHLETE_USER_PROFILE = Symbol('ATHLETE_USER_PROFILE');

export interface IAthleteUserProfile {
  exists(userId: string): Promise<boolean>;
}
