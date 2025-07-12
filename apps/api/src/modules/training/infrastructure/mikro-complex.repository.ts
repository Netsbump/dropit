import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Complex } from "../domain/complex.entity";
import { IComplexRepository } from "../application/ports/complex.repository";
import { Injectable } from "@nestjs/common";
import { Member } from "../../identity/organization/organization.entity";

@Injectable()
export class MikroComplexRepository extends EntityRepository<Complex> implements IComplexRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Complex);
  }

  private async getCoachFilterConditions(organizationId: string) {
    // Get coaches of the organization
    const coachMembers = await this.em.find(Member, {
      organization: { id: organizationId },
      role: { $in: ['admin', 'owner'] }
    });
  
    const coachUserIds = coachMembers.map(member => member.user.id);
    
    // Filter conditions : complex public OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public complex
        { createdBy: { id: { $in: coachUserIds } } } // Complex created by a coach
      ]
    };
  }

  async getOne(id: string, organizationId: string): Promise<Complex | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      Complex, 
      { id, $or: filterConditions.$or },
      { 
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
          'createdBy'
        ] 
      }
    );
  }

  async getAll(organizationId: string): Promise<Complex[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      Complex,
      filterConditions,
      {
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
          'createdBy'
        ],
      }
    );
  }

  async save(complex: Complex): Promise<void> {
    return await this.em.persistAndFlush(complex);
  }

  async remove(complex: Complex): Promise<void> {
    return await this.em.removeAndFlush(complex);
  }
} 