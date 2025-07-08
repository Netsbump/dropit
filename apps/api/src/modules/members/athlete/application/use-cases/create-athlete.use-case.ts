import { AthleteDto, CreateAthlete } from '@dropit/schemas';
import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../domain/athlete.entity';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';
import { CreatedAthletePresenter } from '../../interface/presenter/create-athlete.presenter';
import { UserService } from '../../../auth/user.service';
import { AthleteReadRepository } from '../ports/athlete-read.repository';

@Injectable()
export class CreateAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository,
    private readonly athleteReadRepository: AthleteReadRepository,
    private readonly userService: UserService
  ) {}

  async execute(data: CreateAthlete, userId: string): Promise<AthleteDto> {

    //1. Check if User exists 
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if User already has an athlete profile
    const existingAthlete = await this.athleteReadRepository.getOne(userId);
    if (existingAthlete) {
      throw new BadRequestException('User already has an athlete profile');
    }

    //3. Create Athlete
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);
    if (data.country) {
      athlete.country = data.country;
    }
    athlete.user = user;

    //4. Save Athlete
    await this.athleteWriteRepository.save(athlete);

    //5. Return Athlete
    return CreatedAthletePresenter.toDto(athlete);

  }
}
