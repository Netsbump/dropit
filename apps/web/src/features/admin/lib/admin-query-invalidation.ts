import { QueryClient } from '@tanstack/react-query';
import { adminQueryKeys } from './admin-query-keys';

export async function invalidateOrganizations(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: adminQueryKeys.organizations.all(),
  });
}

export async function invalidateUsers(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: adminQueryKeys.users.all(),
  });
}
