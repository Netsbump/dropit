import { Athlete } from '../../athletes/domain/athlete.entity';
import { IAthleteRepository } from '../../athletes/application/ports/athlete.repository.port';
import { IMemberRepository } from './ports/member.repository.port';
import {
  IInvitationUseCases,
  InvitationNotificationContext,
  InvitationRecipientProfile,
} from './ports/invitation-use-cases.port';
import { IUserUseCases } from './ports/user-use-cases.port';

export class InvitationUseCases implements IInvitationUseCases {
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

      const athlete = new Athlete();
      athlete.firstName = firstName;
      athlete.lastName = lastName;
      athlete.user = user;
      await this.athleteRepository.save(athlete);

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
