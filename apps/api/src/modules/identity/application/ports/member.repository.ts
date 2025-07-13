import { Member } from "../../domain/organization/member.entity";

export const MEMBER_REPO = Symbol('MEMBER_REPO');

export type CoachFilterConditions = {
  $or: [
    { createdBy: null }, // Public entities
    { createdBy: { id: { $in: string[] } } }, // Entities created by coaches
  ];
};

export interface IMemberRepository {
  getCoachUserIds(organizationId: string): Promise<Member[]>;
  getAthleteUserIds(organizationId: string): Promise<Member[]>;
  isUserCoachInOrganization(userId: string, organizationId: string): Promise<boolean>;
  isUserAthleteInOrganization(athleteId: string, organizationId: string): Promise<boolean>;
}

