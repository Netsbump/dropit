import { createFileRoute } from '@tanstack/react-router';
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';
import { LoginOtpForm } from '@/features/auth/login-otp-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { z } from 'zod';
import { useTranslation } from '@dropit/i18n';
import { AuthLayout } from '@/features/auth/auth-layout';

export const Route = createFileRoute('/_auth/login/otp')({
  validateSearch: z.object({
    email: z.string().email(),
  }),
  component: LoginOtp,
});

function LoginOtp() {
  const { email } = Route.useSearch();
  const { redirectBasedOnRole } = useAuthRedirect();
  const { t } = useTranslation(['auth']);

  return (
    <AuthLayout>
      <AuthFormHeader
        title={t('login.title')}
        description={t('login.otpDescription')}
      />

      <LoginOtpForm email={email} onSuccess={redirectBasedOnRole} />
    </AuthLayout>
  );
}
