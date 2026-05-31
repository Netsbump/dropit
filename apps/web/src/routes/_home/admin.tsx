import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useTranslation } from '@dropit/i18n';
import { GLOBAL_ROLE } from '@dropit/schemas';
import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router';
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
  const location = useLocation();

  useEffect(() => {
    setPageMeta({ title: t('title') });
  }, [setPageMeta, t]);

  if (location.pathname === '/admin') {
    return <Navigate to="/admin/users" replace />;
  }

  return <Outlet />;
}
