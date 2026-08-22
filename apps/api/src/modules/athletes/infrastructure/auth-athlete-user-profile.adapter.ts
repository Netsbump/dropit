import { IUserUseCases } from '../../auth/application/ports/user-use-cases.port';
import { IAthleteUserProfile } from '../application/ports/out/athlete-user-profile.port';
import type { UserId } from '../../../shared/kernel/identity';

export class AuthAthleteUserProfileAdapter implements IAthleteUserProfile {
  constructor(private readonly userUseCases: IUserUseCases) {}

  async exists(userId: UserId): Promise<boolean> {
    const user = await this.userUseCases.findById(userId);
    return user !== null;
  }
}
