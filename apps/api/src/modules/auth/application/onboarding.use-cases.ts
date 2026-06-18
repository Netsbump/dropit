import { RequestAccessInput } from '@dropit/schemas';
import { IOnboardingUseCases } from './ports/onboarding-use-cases.port';
import { INotificationUseCases } from '../../notification/application/ports/inbound/notification-use-cases.port';
import { IInvitationRepository } from './ports/invitation.repository.port';
import { IMemberRepository } from './ports/member.repository.port';
import { IUserUseCases } from './ports/user-use-cases.port';
import { Member } from '../domain/organization/member.entity';
import {
  invitableOrganizationRoleSchema,
  organizationRoleSchema,
  type InvitableOrganizationRole,
} from '@dropit/schemas';
import { InvitationException } from './exceptions/invitation.exceptions';

export class OnboardingUseCases implements IOnboardingUseCases {
  constructor(
    private readonly notificationUseCases: INotificationUseCases,
    private readonly invitationRepository: IInvitationRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly userUseCases: IUserUseCases
  ) {}

  async createCoachAccessRequest(data: RequestAccessInput): Promise<void> {
    await this.notificationUseCases.sendRequestAccess(data);
  }

  async acceptInvitation(
    invitationId: string
  ): Promise<InvitableOrganizationRole> {
    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw InvitationException.notFound(invitationId);
    }

    if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      throw InvitationException.expiredOrUsed();
    }

    const user = await this.userUseCases.getByEmail(invitation.email);

    if (!user) {
      throw InvitationException.userNotFound(invitation.email);
    }

    const existingMember = await this.memberRepository.findByUserId(user.id);

    if (existingMember) {
      await this.memberRepository.remove(existingMember);
    }

    const member = new Member();
    member.user = user;
    member.organization = invitation.organization;
    const parsedRole = organizationRoleSchema.safeParse(invitation.role);
    if (!parsedRole.success) {
      throw new Error(`Invalid invitation role: ${invitation.role}`);
    }
    member.role = parsedRole.data;
    member.createdAt = new Date();
    await this.memberRepository.save(member);

    invitation.status = 'accepted';
    await this.invitationRepository.save(invitation);

    return invitableOrganizationRoleSchema.parse(member.role);
  }
}
