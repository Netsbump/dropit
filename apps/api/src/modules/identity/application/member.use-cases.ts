import { CoachFilterConditions, IMemberRepository } from "./ports/member.repository.port";
import { IMemberUseCases } from "./ports/member-use-cases.port";

/**
 * Member Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of member/organization business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class MemberUseCases implements IMemberUseCases {
  constructor(
    private readonly memberRepository: IMemberRepository,
  ) {}

      /**
   * Get the IDs of the coaches (admin/owner) of an organization
   * @param organizationId - ID of the organization
   * @returns Array of IDs of the coaches
   * @throws NotFoundException if no coach is found
   */
  async getCoachUserIds(organizationId: string): Promise<string[]> {
    const coachMembers = await this.memberRepository.getCoachUserIds(organizationId);

    if (coachMembers.length === 0) {
      throw new Error(`Coach members with organization id ${organizationId} not found`);
    }

    return coachMembers.map((member) => member.user.id);
  }

  /**
   * Get the IDs of the athletes of an organization
   * @param organizationId - ID of the organization
   * @returns Array of IDs of the athletes
   * @throws Error if no athlete is found
   */
  async getAthleteUserIds(organizationId: string): Promise<string[]> {
    const athleteMembers = await this.memberRepository.getAthleteUserIds(organizationId);

    if (athleteMembers.length === 0) {
      throw new Error(`Athlete members with organization id ${organizationId} not found`);
    }

    return athleteMembers.map((member) => member.user.id);
  }

  /**
   * Check if a user is a coach of an organization
   * @param userId - ID of the user
   * @param organizationId - ID of the organization
   * @returns true if the user is a coach in the organization
  */
  async isUserCoachInOrganization(userId: string, organizationId: string): Promise<boolean> {
    return await this.memberRepository.isUserCoachInOrganization(userId, organizationId);
  }

  /**
   * Check if an athlete belongs to an organization
   * @param athleteId - ID of the athlete
   * @param organizationId - ID of the organization
   * @returns true if the user is an athlete in the organization
   */
  async isUserAthleteInOrganization(athleteId: string, organizationId: string): Promise<boolean> {
    return await this.memberRepository.isUserAthleteInOrganization(athleteId, organizationId);
  }

  /**
   * Generate the filter conditions for entities created by coaches
   * @param organizationId - ID of the organization
   * @returns Filter conditions for MikroORM
  */
  async getCoachFilterConditions(organizationId: string): Promise<CoachFilterConditions> {
  const coachUserIds = await this.getCoachUserIds(organizationId);
  
  return {
    $or: [
      { createdBy: null }, // Public entities
      { createdBy: { id: { $in: coachUserIds } } }, // Entities created by coaches
    ],
  };
 }

}