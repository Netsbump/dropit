import { createLazyFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';
import { AuthLogo } from '@/features/auth/auth-logo';
import { LoginAdminForm } from '@/features/auth/login-admin-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { ImageCard } from '@/features/auth/image-card';

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
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <ImageCard />

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <AuthLogo />

          <AuthFormHeader
            title={t('login.title')}
            description={t('login.description')}
          />

          <LoginAdminForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}
