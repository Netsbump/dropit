import { z } from "zod";
import { accessSchema } from '@dropit/schemas';

export const accessContract = {
  requestAccess: {
    method: 'POST',
    path: '/request-access',
    summary: 'Submit a coach access request',
    body: accessSchema,
    responses: {
      202: z.object({
        accepted: z.literal(true),
      }),
    }
  }
} as const;

