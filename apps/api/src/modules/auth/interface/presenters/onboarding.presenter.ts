import { InvitationException } from '../../application/exceptions/invitation.exceptions';
import type { InvitableOrganizationRole } from '@dropit/schemas';

export const OnboardingPresenter = {
  presentCoachAccessAccepted() {
    return {
      status: 202 as const,
      body: { accepted: true as const },
    };
  },

  presentInvitationAccepted(organizationRole: InvitableOrganizationRole) {
    return {
      status: 200 as const,
      body: { organizationRole },
    };
  },

  presentError(error: Error) {
    // Handle custom invitation exceptions
    if (error instanceof InvitationException) {
      return {
        status: error.statusCode as 404 | 410 | 500,
        body: { message: error.message },
      };
    }

    // Fallback for unexpected errors
    console.error('Onboarding unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' },
    };
  },
};
