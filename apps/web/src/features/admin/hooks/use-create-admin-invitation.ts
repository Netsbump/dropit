import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invalidateInvitations,
  invalidateUsers,
} from '../lib/admin-query-invalidation';

interface CreateAdminInvitationInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  organizationRole: 'admin' | 'member';
}

export function useCreateAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdminInvitationInput) => {
      const response = await api.admin.createInvitation({ body: input });
      if (response.status !== 201) {
        throw new Error('Failed to create admin invitation');
      }
      return response.body;
    },
    onSuccess: async () => {
      await Promise.all([
        invalidateUsers(queryClient),
        invalidateInvitations(queryClient),
      ]);
    },
  });
}
