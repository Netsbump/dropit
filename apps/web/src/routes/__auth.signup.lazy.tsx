import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/shared/components/auth/signup-form';
import { authClient } from '../lib/auth-client';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/__auth/signup')({
  component: Signup,
});

function Signup() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && sessionData) {
      redirectBasedOnRole();
    }
  }, [sessionData, isPending]);

  const redirectBasedOnRole = async () => {
    try {
      const activeMember = await authClient.organization.getActiveMember();
      if (activeMember?.data) {
        const userRole = activeMember.data.role;
        
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

  const handleSignupSuccess = () => {
    redirectBasedOnRole();
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('signup.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('signup.description')}
          </p>
        </div>

        <SignupForm 
          onSuccess={handleSignupSuccess}
          showAlternative={true}
          showRedirect={true}
          showTerms={true}
        />
      </div>
    </div>
  );
}
