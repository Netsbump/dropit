import { Organization } from '../domain/organization/organization.entity';
import { IOrganizationRepository } from './ports/organization.repository.port';
import { IOrganizationUseCases } from './ports/organization-use-cases.port';

/**
 * Organization Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of organization business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class OrganizationUseCases implements IOrganizationUseCases {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async getOne(organizationId: string): Promise<Organization> {
    const organization = await this.organizationRepository.getOne(organizationId);

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    return organization;
  }

} 