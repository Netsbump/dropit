import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginEmailForm } from '@/features/auth/login-email-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { AuthLayout } from '@/features/auth/auth-layout';
import { useTranslation } from '@dropit/i18n';

export const Route = createLazyFileRoute('/_auth/login/')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth']);

  const handleSuccess = (email: string) => {
    navigate({ to: '/login/otp', search: { email } });
  };

  return (
    <AuthLayout>
      <AuthFormHeader
        title={t('login.title')}
        description={t('login.description')}
      />

      <LoginEmailForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
