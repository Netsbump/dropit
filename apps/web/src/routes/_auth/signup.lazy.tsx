import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/features/auth/signup-form';
import { AuthLogo } from '@/features/auth/auth-logo';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { ImageCard } from '@/features/auth/image-card';

export const Route = createLazyFileRoute('/_auth/signup')({
  component: Signup,
});

function Signup() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();

  const handleSuccess = () => {
    //TODO: Redirect into specific info page after signup (eg: You will received an email to validate your account)
    navigate({ to: '/login' });
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <ImageCard />

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <AuthLogo />

          <AuthFormHeader title={t('signup.title')} description={t('signup.description')} />

          <SignupForm
            onSuccess={handleSuccess}
            showRedirect={true}
            showTerms={true}
          />
        </div>
      </div>
    </div>
  );
}
