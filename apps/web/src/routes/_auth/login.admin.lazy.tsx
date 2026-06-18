import { createLazyFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';
import { LoginAdminForm } from '@/features/auth/login-admin-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { AuthLayout } from '@/features/auth/auth-layout';

export const Route = createLazyFileRoute('/_auth/login/admin')({
  component: Login,
});

function Login() {
  const { t } = useTranslation(['auth']);
  const { redirectBasedOnRole } = useAuthRedirect();

  const handleLoginSuccess = () => {
    redirectBasedOnRole();
  };

  return (
    <AuthLayout>
      <AuthFormHeader
        title={t('login.title')}
        description={t('login.description')}
      />

      <LoginAdminForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}
