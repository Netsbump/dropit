import { z } from 'zod';
import { accessSchema, invitableOrganizationRoleSchema } from '@dropit/schemas';

export const onboardingContract = {
  requestCoachAccess: {
    method: 'POST' as const,
    path: '/onboarding/coach-access',
    summary: 'Submit a coach access request',
    body: accessSchema,
    responses: {
      202: z.object({
        accepted: z.literal(true),
      }),
    },
  },
  acceptInvitation: {
    method: 'POST' as const,
    path: '/onboarding/invitation/:invitationId/accept',
    summary: 'Accept an organization invitation by token',
    pathParams: z.object({
      invitationId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        organizationRole: invitableOrganizationRoleSchema,
      }),
      404: z.object({
        message: z.string(),
      }),
      410: z.object({
        message: z.string(),
      }),
    },
  },
} as const;
