import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AthletesModule } from '../athletes/athletes.module';
import {
  MEMBER_REPO,
  IMemberRepository,
} from '../auth/application/ports/member.repository.port';
import {
  USER_USE_CASES,
  IUserUseCases,
} from '../auth/application/ports/user-use-cases.port';
import {
  ATHLETE_REPO,
  IAthleteRepository,
} from '../athletes/application/ports/out/athlete.repository.port';
import { InvitationUseCases } from './application/invitation.use-cases';
import { InvitationRecipientService } from './application/invitation-recipient.service';
import { INVITATION_USE_CASES } from './application/ports/invitation-use-cases.port';
import {
  INVITATION_AUTH_PROVIDER,
  IInvitationAuthProvider,
} from './application/ports/invitation-auth-provider.port';
import {
  INVITATION_RECIPIENT_SERVICE,
  IInvitationRecipientService,
} from './application/ports/invitation-recipient.port';
import { BetterAuthInvitationProviderAdapter } from './infrastructure/better-auth-invitation-provider.adapter';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => AthletesModule)],
  providers: [
    BetterAuthInvitationProviderAdapter,
    {
      provide: INVITATION_AUTH_PROVIDER,
      useClass: BetterAuthInvitationProviderAdapter,
    },
    {
      provide: INVITATION_RECIPIENT_SERVICE,
      useFactory: (
        memberRepo: IMemberRepository,
        userUseCases: IUserUseCases,
        athleteRepository: IAthleteRepository
      ) =>
        new InvitationRecipientService(
          memberRepo,
          userUseCases,
          athleteRepository
        ),
      inject: [MEMBER_REPO, USER_USE_CASES, ATHLETE_REPO],
    },
    {
      provide: INVITATION_USE_CASES,
      useFactory: (
        recipientService: IInvitationRecipientService,
        invitationAuthProvider: IInvitationAuthProvider
      ) => new InvitationUseCases(recipientService, invitationAuthProvider),
      inject: [INVITATION_RECIPIENT_SERVICE, INVITATION_AUTH_PROVIDER],
    },
  ],
  exports: [INVITATION_USE_CASES, INVITATION_RECIPIENT_SERVICE],
})
export class InvitationsModule {}
