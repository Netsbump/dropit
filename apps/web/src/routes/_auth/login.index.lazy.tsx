import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginEmailForm } from '@/features/auth/login-email-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { AuthLogo } from '@/features/auth/auth-logo';
import { ImageCard } from '@/features/auth/image-card';
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
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <ImageCard />

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <AuthLogo />

          <AuthFormHeader
            title={t('login.title')}
            description={t('login.description')}
          />

          <LoginEmailForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
