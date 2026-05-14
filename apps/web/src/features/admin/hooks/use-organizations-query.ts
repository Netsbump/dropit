import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/admin-query-keys';

type OrganizationListItem = {
  id: string;
  name: string;
};

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.organizations.list(),
    queryFn: async (): Promise<OrganizationListItem[]> => {
      const response = await authClient.organization.list();

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.map((organization) => ({
        id: organization.id,
        name: organization.name,
      }));
    },
  });
}
