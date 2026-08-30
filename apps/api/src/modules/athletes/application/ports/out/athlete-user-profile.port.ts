import type { UserId } from '../../../../../shared/kernel/identity';

export const ATHLETE_USER_PROFILE = Symbol('ATHLETE_USER_PROFILE');

export interface IAthleteUserProfile {
  exists(userId: UserId): Promise<boolean>;
}
