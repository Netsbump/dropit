import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Organization } from '../domain/organization/organization.entity';
import { IOrganizationRepository, ORGANIZATION_REPO } from './ports/organization.repository';

@Injectable()
export class OrganizationUseCases {
  constructor(
    @Inject(ORGANIZATION_REPO) private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async getOne(organizationId: string): Promise<Organization> {
    const organization = await this.organizationRepository.getOne(organizationId);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    return organization;
  }

} 