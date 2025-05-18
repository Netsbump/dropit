// Dans votre provider d'authentification ou un hook personnalisé
import { api } from '@/lib/api';
import { User } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        // Le endpoint GET /auth/me n'a pas besoin de body
        const response = await api.auth.me();
        return response.status === 200 ? response.body : null;
      } catch (error) {
        return null;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!data;

  return {
    user: data as User | null,
    isAuthenticated,
    isLoading,
  };
}
