import { Organization } from '../../domain/organization/organization.entity';

/**
 * Organization Use Cases Port
 *
 * @description
 * Defines the contract for organization business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * OrganizationUseCases and injected into other modules via dependency injection.
 */
export interface IOrganizationUseCases {
  /**
   * Get one organization by ID
   */
  getOne(organizationId: string): Promise<Organization>;
}

/**
 * Injection token for IOrganizationUseCases
 * Use this token in @Inject() decorators in other modules
 */
export const ORGANIZATION_USE_CASES = Symbol('ORGANIZATION_USE_CASES');
