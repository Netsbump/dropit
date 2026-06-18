import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/admin-query-keys';

export function useAdminInvitationsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.invitations.list(),
    queryFn: async () => {
      const response = await api.admin.getInvitations();
      if (response.status !== 200) {
        throw new Error('Failed to load admin invitations');
      }
      return response.body;
    },
  });
}
