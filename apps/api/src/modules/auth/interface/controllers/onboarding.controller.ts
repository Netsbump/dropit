import { onboardingContract } from '@dropit/contract';
import { Controller, Inject } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { ONBOARDING_USE_CASES, IOnboardingUseCases } from '../../application/ports/onboarding-use-cases.port';
import { InvitationException } from '../../application/exceptions/invitation.exceptions';
import { Public } from '../../infrastructure/decorators/auth.decorator';

const c = onboardingContract;

@Controller()
export class OnboardingController {
  constructor(
    @Inject(ONBOARDING_USE_CASES)
    private readonly onboardingUseCases: IOnboardingUseCases,
  ) {}

  @TsRestHandler(c.requestCoachAccess)
  @Public()
  requestCoachAccess(): ReturnType<typeof tsRestHandler<typeof c.requestCoachAccess>> {
    return tsRestHandler(c.requestCoachAccess, async ({ body }) => {
      await this.onboardingUseCases.createCoachAccessRequest(body);
      return { status: 202 as const, body: { accepted: true as const } };
    });
  }

  @TsRestHandler(c.acceptInvitation)
  @Public()
  acceptInvitation(): ReturnType<typeof tsRestHandler<typeof c.acceptInvitation>> {
    return tsRestHandler(c.acceptInvitation, async ({ params }) => {
      try {
        await this.onboardingUseCases.acceptInvitation(params.invitationId);
        return { status: 200 as const, body: { joined: true as const } };
      } catch (error) {
        if (error instanceof InvitationException) {
          const status = error.statusCode === 410 ? 410 as const : 404 as const;
          return { status, body: { message: error.message } };
        }
        throw error;
      }
    });
  }
}
