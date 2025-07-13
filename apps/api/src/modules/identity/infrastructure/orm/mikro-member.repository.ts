import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Member } from "../../domain/organization/member.entity";
import { IMemberRepository } from "../../application/ports/member.repository";

@Injectable()
export class MikroMemberRepository extends EntityRepository<Member> implements IMemberRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Member);
  }

  async getCoachUserIds(organizationId: string): Promise<Member[]> {
      return await this.em.find(Member, {
        organization: {
          id: organizationId,
        },
        role: { $in: ['admin', 'owner'] }
      });
  }

  async getAthleteUserIds(organizationId: string): Promise<Member[]> {
      return await this.em.find(Member, {
        organization: { id: organizationId },
        role: 'member'
      });
  }

  async isUserCoachInOrganization(userId: string, organizationId: string): Promise<boolean> {
      const member = await this.em.findOne(Member, {
      user: userId,
      organization: organizationId,
      role: { $in: ['admin', 'owner'] }
      });
      
      return !!member;
  }

  async isUserAthleteInOrganization(athleteId: string, organizationId: string): Promise<boolean> {
      const member = await this.em.findOne(Member, {
        user: { id: athleteId },
        organization: { id: organizationId },
        role: 'member'
      });
      
      return !!member;
  }
}