import { AthleteDetailsDto } from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AthletePresenter } from '../../interface/presenter/athlete.presenter';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';
import { OrganizationService } from '../../../organization/organization.service';

@Injectable()
export class GetAthleteUseCase {
  constructor(
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async execute(athleteId: string, organizationId: string): Promise<AthleteDetailsDto> {

    //1. Validate organization
    const organization = await this.organizationService.getOrganizationById(organizationId);

    //2. check if athleteId is in organization
    await this.organizationService.checkAthleteBelongsToOrganization(athleteId, organization.id);

    //3. Get athlete from repository
    const athlete = await this.athleteReadRepository.findOneWithDetails(athleteId);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    return AthletePresenter.toDto(athlete);
  }
}
