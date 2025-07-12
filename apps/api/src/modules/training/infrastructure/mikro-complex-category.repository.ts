import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { ComplexCategory } from "../domain/complex-category.entity";
import { IComplexCategoryRepository } from "../application/ports/complex-category.repository";
import { Injectable } from "@nestjs/common";
import { Member } from "../../identity/organization/organization.entity";

@Injectable()
export class MikroComplexCategoryRepository extends EntityRepository<ComplexCategory> implements IComplexCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, ComplexCategory);
  }

  private async getCoachFilterConditions(organizationId: string) {
    // Get coaches of the organization
    const coachMembers = await this.em.find(Member, {
      organization: { id: organizationId },
      role: { $in: ['admin', 'owner'] }
    }, {
      populate: ['user']
    });
  
    const coachUserIds = coachMembers.map(member => member.user.id);
    
    // Filter conditions : complex category public OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public complex category
        { createdBy: { id: { $in: coachUserIds } } } // Complex category created by a coach
      ]
    };
  }

  async getOne(id: string, organizationId: string): Promise<ComplexCategory | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      ComplexCategory, 
      { id, $or: filterConditions.$or },
      { populate: ['createdBy'] }
    );
  }

  async getAll(organizationId: string): Promise<ComplexCategory[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      ComplexCategory, 
      filterConditions,
      { populate: ['createdBy'] }
    );
  }

  async save(complexCategory: ComplexCategory): Promise<void> {
    return await this.em.persistAndFlush(complexCategory);
  }

  async remove(complexCategory: ComplexCategory): Promise<void> {
    return await this.em.removeAndFlush(complexCategory);
  }
} 