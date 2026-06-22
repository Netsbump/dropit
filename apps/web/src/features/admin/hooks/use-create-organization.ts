import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/admin-query-keys';

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await authClient.organization.create({
        name,
        slug: toSlug(name),
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.organizations.all(),
      });
    },
  });
}
