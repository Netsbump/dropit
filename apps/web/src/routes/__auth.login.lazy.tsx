import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import { useTranslation } from '@dropit/i18n';
import { LoginForm } from '@/shared/components/auth/login-form';

export const Route = createLazyFileRoute('/__auth/login')({
  component: Login,
});

function Login() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && sessionData) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [sessionData, navigate, isPending]);

  const handleLoginSuccess = () => {
    navigate({ to: '/dashboard', replace: true });
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('login.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('login.description')}
          </p>
        </div>

        <LoginForm 
          onSuccess={handleLoginSuccess}
          showAlternative={true}
          showRedirect={true}
        />
      </div>
    </div>
  );
}
