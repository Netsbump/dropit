import { ORGANIZATION_ROLE } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { getBackOfficeAccessState } from './auth-access';

export function useCanSeeAthletesLink() {
  const { data } = useQuery({
    queryKey: ['auth', 'backoffice-access'],
    queryFn: getBackOfficeAccessState,
    staleTime: 60_000,
    retry: false,
  });

  const canSeeAthletesLink =
    !!data?.isAuthenticated &&
    data.organizationRole === ORGANIZATION_ROLE.ADMIN;

  return {
    data,
    canSeeAthletesLink,
  };
}
