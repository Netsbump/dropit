import { api } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const ORGANIZATION_ATHLETES_PAGE_SIZE = 20;

const emptyOrganizationAthletesPage = (offset: number) => ({
  data: [],
  pagination: {
    limit: ORGANIZATION_ATHLETES_PAGE_SIZE,
    offset,
    total: 0,
    hasNext: false,
  },
});

type UseOrganizationAthletesQueryParams = {
  organizationId?: string;
  offset: number;
  enabled: boolean;
};

export function useOrganizationAthletesQuery({
  organizationId,
  offset,
  enabled,
}: UseOrganizationAthletesQueryParams) {
  return useQuery({
    queryKey: [
      'admin',
      'organization-athletes',
      organizationId,
      { limit: ORGANIZATION_ATHLETES_PAGE_SIZE, offset },
    ],
    enabled: enabled && Boolean(organizationId),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!organizationId) {
        return emptyOrganizationAthletesPage(offset);
      }

      const response = await api.athlete.getAthletesByOrganization({
        params: { organizationId },
        query: { limit: ORGANIZATION_ATHLETES_PAGE_SIZE, offset },
      });

      if (response.status !== 200) {
        return emptyOrganizationAthletesPage(offset);
      }

      return {
        data: response.body.data.map((athlete) => ({
          id: athlete.id,
          name: `${athlete.firstName} ${athlete.lastName}`,
          birthday: athlete.birthday,
        })),
        pagination: response.body.pagination,
      };
    },
  });
}
