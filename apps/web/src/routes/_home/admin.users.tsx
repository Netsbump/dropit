import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { UsersSection } from '@/features/admin/components/users-section';
import { GLOBAL_ROLE } from '@dropit/schemas';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_home/admin/users')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.userRole !== GLOBAL_ROLE.ADMIN) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <div className="flex h-full flex-col p-4">
      <UsersSection />
    </div>
  );
}
