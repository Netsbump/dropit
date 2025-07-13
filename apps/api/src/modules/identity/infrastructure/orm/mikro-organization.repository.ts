import { Injectable, NotFoundException } from "@nestjs/common";
import { IOrganizationRepository } from "../../application/ports/organization.repository";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Organization } from "../../domain/organization/organization.entity";

@Injectable()
export class MikroOrganizationRepository extends EntityRepository<Organization> implements IOrganizationRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Organization);
  }

  async getOne(organizationId: string): Promise<Organization | null> {
    return await this.em.findOne(Organization, { id: organizationId });
  }

}