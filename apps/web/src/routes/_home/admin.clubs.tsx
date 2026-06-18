import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { OrganizationsSection } from '@/features/admin/components/organizations-section';
import { GLOBAL_ROLE } from '@dropit/schemas';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_home/admin/clubs')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.userRole !== GLOBAL_ROLE.ADMIN) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminClubsPage,
});

function AdminClubsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-4">
      <OrganizationsSection />
    </div>
  );
}
