import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';
import { UserService } from '../../../auth/user.service';

@Injectable()
export class DeleteAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository,
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository,
    private readonly userService: UserService
  ) {}

  async execute(idAthlete: string, userId: string): Promise<void> {

    //1. Get User
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    //2. Get Athlete
    const athlete = await this.athleteReadRepository.getOne(idAthlete);

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    //3. Check if Athlete has a user  
    if (!athlete.user) {
      throw new NotFoundException('Athlete has no user');
    }

    //4. Check if Athlete belongs to User
    if (athlete.user.id !== userId) {
      throw new ForbiddenException('Athlete does not belong to User');
    }

    //5. Delete Athlete
    await this.athleteWriteRepository.remove(athlete);
  }
}
