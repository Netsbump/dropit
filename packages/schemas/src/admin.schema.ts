import { z } from 'zod';

export const invitableOrganizationRoleSchema = z.enum(['admin', 'member']);

export type InvitableOrganizationRole = z.infer<
  typeof invitableOrganizationRoleSchema
>;

export const adminUserListItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  birthday: z.date().optional(),
  organizationId: z.string(),
  organizationName: z.string(),
  organizationRole: invitableOrganizationRoleSchema,
});

export const adminInvitationListItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  organizationId: z.string(),
  organizationName: z.string(),
  organizationRole: invitableOrganizationRoleSchema,
  inviterName: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export const createAdminInvitationSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    organizationId: z.string(),
    organizationRole: invitableOrganizationRoleSchema,
  })
  .strict();
