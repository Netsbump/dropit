import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/admin-query-keys';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.users.list(),
    queryFn: async () => {
      const response = await api.admin.getUsers();
      if (response.status !== 200) {
        throw new Error('Failed to load admin users');
      }
      return response.body;
    },
  });
}
