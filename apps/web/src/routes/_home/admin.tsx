import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { OrganizationsSection } from '@/features/admin/components/organizations-section';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useTranslation } from '@dropit/i18n';
import { GLOBAL_ROLE } from '@dropit/schemas';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_home/admin')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.userRole !== GLOBAL_ROLE.ADMIN) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const { t } = useTranslation(['admin']);
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('title') });
  }, [setPageMeta, t]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <OrganizationsSection />
    </div>
  );
}
