import { api } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type UseAthletesPageQueryParams = {
  limit: number;
  offset: number;
  search: string;
};

export function useAthletesPageQuery({
  limit,
  offset,
  search,
}: UseAthletesPageQueryParams) {
  const searchQuery = search.trim();

  return useQuery({
    queryKey: ['athletes', { limit, offset, search: searchQuery }],
    queryFn: async () => {
      const response = await api.athlete.getAthletes({
        query: {
          limit,
          offset,
          ...(searchQuery ? { search: searchQuery } : {}),
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to load athletes');
      }

      return response.body;
    },
    placeholderData: keepPreviousData,
  });
}
