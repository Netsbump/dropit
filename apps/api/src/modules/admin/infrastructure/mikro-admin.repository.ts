import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Member } from '../../auth/domain/organization/member.entity';
import { Invitation } from '../../auth/domain/organization/invitation.entity';
import { AthleteEntity } from '../../database/entities/athlete.entity';
import {
  invitableOrganizationRoleSchema,
  type InvitableOrganizationRole,
} from '@dropit/schemas';
import {
  AdminInvitationListItem,
  AdminUserListItem,
  IAdminRepository,
} from '../application/ports/admin.repository.port';

@Injectable()
export class MikroAdminRepository implements IAdminRepository {
  constructor(private readonly em: EntityManager) {}

  private readonly invitableRoles = [
    ...invitableOrganizationRoleSchema.options,
  ];

  private toInvitableOrganizationRole(role: string): InvitableOrganizationRole {
    return invitableOrganizationRoleSchema.parse(role);
  }

  async getUsers(): Promise<AdminUserListItem[]> {
    const members = await this.em.find(
      Member,
      { role: { $in: this.invitableRoles } },
      { populate: ['user', 'organization'] }
    );

    const userIds = members.map((member) => member.user.id);
    const athletes = userIds.length
      ? await this.em.find(
          AthleteEntity,
          { user: { id: { $in: userIds } } },
          { populate: ['user'] }
        )
      : [];

    const birthdayByUserId = new Map<string, Date | null>();
    for (const athlete of athletes) {
      birthdayByUserId.set(athlete.user.id, athlete.birthday);
    }

    return members.map((member) => {
      const [firstName = '', ...rest] = member.user.name.split(' ');
      return {
        id: member.user.id,
        firstName,
        lastName: rest.join(' '),
        email: member.user.email,
        birthday: birthdayByUserId.get(member.user.id) ?? undefined,
        organizationId: member.organization.id,
        organizationName: member.organization.name,
        organizationRole: this.toInvitableOrganizationRole(member.role),
      };
    });
  }

  async getPendingInvitations(): Promise<AdminInvitationListItem[]> {
    const invitations = await this.em.find(
      Invitation,
      { status: 'pending' },
      { populate: ['inviter', 'organization'] }
    );

    return invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      organizationId: invitation.organization.id,
      organizationName: invitation.organization.name,
      organizationRole: this.toInvitableOrganizationRole(invitation.role),
      inviterName: invitation.inviter.name,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    }));
  }
}
