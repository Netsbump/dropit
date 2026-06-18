import {
  adminInvitationListItemSchema,
  adminUserListItemSchema,
  createAdminInvitationSchema,
} from '@dropit/schemas';
import { z } from 'zod';

export const adminContract = {
  getUsers: {
    method: 'GET',
    path: '/admin/users',
    summary: 'Get active users with organization role',
    responses: {
      200: z.array(adminUserListItemSchema),
      403: z.object({ message: z.string() }),
      500: z.object({ message: z.string() }),
    },
  },
  getInvitations: {
    method: 'GET',
    path: '/admin/invitations',
    summary: 'Get pending invitations',
    responses: {
      200: z.array(adminInvitationListItemSchema),
      403: z.object({ message: z.string() }),
      500: z.object({ message: z.string() }),
    },
  },
  createInvitation: {
    method: 'POST',
    path: '/admin/invitations',
    summary: 'Invite user to organization',
    body: createAdminInvitationSchema,
    responses: {
      201: z.object({ message: z.string() }),
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
      500: z.object({ message: z.string() }),
    },
  },
} as const;
