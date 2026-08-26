import { parseUserId } from '../../../shared/kernel/identity';
import { IAthleteRepository } from '../../athletes/application/ports/out/athlete.repository.port';
import { Athlete } from '../../athletes/domain/athlete';
import { IMemberRepository } from '../../auth/application/ports/member.repository.port';
import { IUserUseCases } from '../../auth/application/ports/user-use-cases.port';
import { IInvitationRecipientService } from './ports/invitation-recipient.port';
import {
  InvitationNotificationContext,
  InvitationRecipientProfile,
} from './ports/invitation-use-cases.port';

export class InvitationRecipientService implements IInvitationRecipientService {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly athleteRepository: IAthleteRepository
  ) {}

  async prepareRecipient(
    email: string,
    organizationId: string,
    profile: InvitationRecipientProfile
  ): Promise<InvitationNotificationContext> {
    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const existingUser = await this.userUseCases.getByEmail(email);

    if (!existingUser) {
      const user = await this.userUseCases.create({
        name: fullName || email,
        email,
        emailVerified: false,
      });

      const athlete = new Athlete({
        userId: parseUserId(user.id),
        firstName,
        lastName,
      });
      await this.athleteRepository.add(athlete);

      return { isNewUser: true, hasOtherOrganization: false };
    }

    const existingMember = await this.memberRepository.findByUserId(
      existingUser.id
    );
    const hasOtherOrganization =
      existingMember !== null &&
      existingMember.organization.id !== organizationId;

    return { isNewUser: false, hasOtherOrganization };
  }

  async getNotificationContext(
    email: string,
    organizationId: string
  ): Promise<InvitationNotificationContext> {
    const existingUser = await this.userUseCases.getByEmail(email);
    if (!existingUser) {
      return { isNewUser: true, hasOtherOrganization: false };
    }

    const existingMember = await this.memberRepository.findByUserId(
      existingUser.id
    );
    const hasOtherOrganization =
      existingMember !== null &&
      existingMember.organization.id !== organizationId;

    return { isNewUser: false, hasOtherOrganization };
  }
}
