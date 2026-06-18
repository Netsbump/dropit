import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@dropit/i18n';
import { SignupForm } from '@/features/auth/signup-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { AuthLayout } from '@/features/auth/auth-layout';

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
    <AuthLayout>
      <AuthFormHeader
        title={t('signup.title')}
        description={t('signup.description')}
      />

      <SignupForm
        onSuccess={handleSuccess}
        showRedirect={true}
        showTerms={true}
      />
    </AuthLayout>
  );
}
