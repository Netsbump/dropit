import { onboardingContract } from '@dropit/contract';
import { Controller, Inject } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  ONBOARDING_USE_CASES,
  IOnboardingUseCases,
} from '../../application/ports/onboarding-use-cases.port';
import { Public } from '../../infrastructure/decorators/auth.decorator';
import { OnboardingPresenter } from '../presenters/onboarding.presenter';

const c = onboardingContract;

@Controller()
export class OnboardingController {
  constructor(
    @Inject(ONBOARDING_USE_CASES)
    private readonly onboardingUseCases: IOnboardingUseCases
  ) {}

  @TsRestHandler(c.requestCoachAccess)
  @Public()
  requestCoachAccess(): ReturnType<
    typeof tsRestHandler<typeof c.requestCoachAccess>
  > {
    return tsRestHandler(c.requestCoachAccess, async ({ body }) => {
      try {
        await this.onboardingUseCases.createCoachAccessRequest(body);
        return OnboardingPresenter.presentCoachAccessAccepted();
      } catch (error) {
        return OnboardingPresenter.presentError(error as Error);
      }
    });
  }

  @TsRestHandler(c.acceptInvitation)
  @Public()
  acceptInvitation(): ReturnType<
    typeof tsRestHandler<typeof c.acceptInvitation>
  > {
    return tsRestHandler(c.acceptInvitation, async ({ params }) => {
      try {
        const organizationRole = await this.onboardingUseCases.acceptInvitation(
          params.invitationId
        );
        return OnboardingPresenter.presentInvitationAccepted(organizationRole);
      } catch (error) {
        return OnboardingPresenter.presentError(error as Error);
      }
    });
  }
}
