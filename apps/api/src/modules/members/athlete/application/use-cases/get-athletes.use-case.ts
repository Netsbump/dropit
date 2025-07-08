import { AthleteDetailsDto } from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AthletePresenter } from '../../interface/presenter/athlete.presenter';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';
import { OrganizationService } from '../../../organization/organization.service';

@Injectable()
export class GetAthletesUseCase {
  constructor(
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async execute(organizationId: string): Promise<AthleteDetailsDto[]> {

    //1. Validate organization
    const organization = await this.organizationService.getOrganizationById(organizationId);

    //2. Get athletes ids from organization
    const athleteUserIds = await this.organizationService.getAthleteUserIds(organization.id);

    //3. Get athletes from repository
    const athletes = await this.athleteReadRepository.findAllWithDetails(athleteUserIds);
    if (!athletes) {
      throw new NotFoundException('Athletes not found');
    }
    
    return AthletePresenter.toDtoList(athletes);
  }
}
