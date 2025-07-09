import { AthleteDto, UpdateAthlete } from '@dropit/schemas';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdatedAthletePresenter } from '../../interface/presenter/update-athlete.presenter';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';
import { UserService } from '../../../auth/user.service';

@Injectable()
export class UpdateAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository,  
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository,
    private readonly userService: UserService
  ) {}

  async execute(idAthlete: string, data: UpdateAthlete, userId: string): Promise<AthleteDto> {

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

    //5. Update Athlete
    if (data.firstName !== undefined) {
      athlete.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      athlete.lastName = data.lastName;
    }

    if (data.birthday !== undefined) {
      athlete.birthday = new Date(data.birthday);
    }

    if (data.country !== undefined) {
      athlete.country = data.country;
    }

    //6. Save Athlete
    await this.athleteWriteRepository.save(athlete);

    //7. Return Athlete
    return UpdatedAthletePresenter.toDto(athlete);
  }
}
