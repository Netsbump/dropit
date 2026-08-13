import { IUserUseCases } from '../../auth/application/ports/user-use-cases.port';
import { IAthleteUserProfile } from '../application/ports/out/athlete-user-profile.port';

export class AuthAthleteUserProfileAdapter implements IAthleteUserProfile {
  constructor(private readonly userUseCases: IUserUseCases) {}

  async exists(userId: string): Promise<boolean> {
    const user = await this.userUseCases.findById(userId);
    return user !== null;
  }
}
