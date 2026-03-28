import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/features/auth/signup-form';
import { AuthLogo } from '@/features/auth/auth-logo';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import loginImage from '@/assets/images/hero-pages/login.svg';

export const Route = createLazyFileRoute('/_auth/signup')({
  component: Signup,
});

function Signup() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    //TODO: Redirect into specific info page after signup (eg: You will received an email to validate your account)
    navigate({ to: '/login' });
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
        {/* Image on the left side */}
        <div className="hidden lg:flex items-center justify-center py-12">
          <img
            src={loginImage}
            alt="Signup illustration"
            className="w-full h-full max-h-[800px] object-contain"
          />
        </div>

        {/* Form on the right side */}
        <div className="w-full max-w-md mx-auto flex items-center">
          <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
            <AuthLogo />

            <AuthFormHeader title={t('signup.title')} description={t('signup.description')} />

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
