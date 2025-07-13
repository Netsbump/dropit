import { Organization } from "../../domain/organization/organization.entity";

export const ORGANIZATION_REPO = Symbol('ORGANIZATION_REPO');

export interface IOrganizationRepository {
  getOne(organizationId: string): Promise<Organization | null>;
}