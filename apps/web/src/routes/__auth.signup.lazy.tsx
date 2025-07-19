import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/shared/components/auth/signup-form';

export const Route = createLazyFileRoute('/__auth/signup')({
  component: Signup,
});

function Signup() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate({ to: '/dashboard', replace: true });
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
