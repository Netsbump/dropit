import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/shared/components/auth/signup-form';
import { authClient } from '../lib/auth-client';
import { useEffect } from 'react';
import { BicepsFlexed } from 'lucide-react';

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
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
        {/* Image à gauche */}
        <div className="hidden lg:flex items-center justify-center py-12">
          <img
            src="/src/assets/images/hero-pages/login.svg"
            alt="Signup illustration"
            className="w-full h-full max-h-[800px] object-contain"
          />
        </div>

        {/* Formulaire à droite */}
        <div className="w-full max-w-md mx-auto flex items-center">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <BicepsFlexed className="h-8 w-8 stroke-[2.5] text-purple-600" />
              <span className="text-xl font-bold text-purple-600">Dropit</span>
            </div>

            <div className="flex flex-col space-y-2 text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {t('signup.title')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('signup.description')}
              </p>
            </div>

            <SignupForm
              onSuccess={handleSignupSuccess}
              showRedirect={true}
              showTerms={true}
            />
          </div>
        </div>
    </div>
  );
}
