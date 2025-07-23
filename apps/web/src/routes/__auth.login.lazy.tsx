import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { authClient } from '../lib/auth-client';
import { useTranslation } from '@dropit/i18n';
import { LoginForm } from '@/shared/components/auth/login-form';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/__auth/login')({
  component: Login,
});

function Login() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && sessionData) {
      redirectBasedOnRole();
    }
  }, [sessionData, navigate, isPending]);

  const redirectBasedOnRole = async () => {
    try {
      const activeMember = await authClient.organization.getActiveMember();
      if (activeMember?.data) {
        const userRole = activeMember.data.role;

        console.log(userRole);
        if (userRole === 'member') {
          navigate({ to: '/download-app', replace: true });
        } else if (userRole === 'owner' || userRole === 'admin') {
          navigate({ to: '/dashboard', replace: true });
        } else {
          navigate({ to: '/onboarding', replace: true });
        }
      } else {
        navigate({ to: '/onboarding', replace: true });
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate({ to: '/onboarding', replace: true });
    }
  };

  const handleLoginSuccess = () => {
    redirectBasedOnRole();
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
