import { AthleteDto, CreateAthlete } from '@dropit/schemas';
import { Inject, Injectable } from '@nestjs/common';
import { Athlete } from '../../domain/athlete.entity';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';
import { CreatedAthletePresenter } from '../../interface/presenter/create-athlete.presenter';

@Injectable()
export class CreateAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository
  ) {}

  async execute(data: CreateAthlete): Promise<AthleteDto> {

    //1. Check if User exists 
    // if (data.userId) {
    //   const user = await this.em.findOne(User, { id: data.userId });
    //   if (user) {
    //     athlete.id = user.id;
    //   }
    // }

    //2. Create Athlete
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);
    if (data.country) {
      athlete.country = data.country;
    }

    //3. Save Athlete
    await this.athleteWriteRepository.save(athlete);

    //4. Return Athlete
    return CreatedAthletePresenter.toDto(athlete);

  }
}
