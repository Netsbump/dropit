import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/admin-query-keys';

type UpdateOrganizationInput = {
  organizationId: string;
  name: string;
};

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, name }: UpdateOrganizationInput) => {
      const response = await authClient.organization.update({
        data: { name },
        organizationId,
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
