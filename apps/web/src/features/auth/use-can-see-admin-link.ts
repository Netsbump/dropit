import { useQuery } from '@tanstack/react-query';
import { GLOBAL_ROLE } from '@dropit/schemas';
import { getBackOfficeAccessState } from './auth-access';

export function useCanSeeAdminLink() {
  const { data } = useQuery({
    queryKey: ['auth', 'backoffice-access'],
    queryFn: getBackOfficeAccessState,
    staleTime: 60_000,
    retry: false,
  });

  const canSeeAdminLink =
    !!data?.isAuthenticated && data.userRole === GLOBAL_ROLE.ADMIN;

  return {
    data,
    canSeeAdminLink,
  };
}
