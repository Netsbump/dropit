import { createFileRoute } from '@tanstack/react-router'
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';
import { AuthLogo } from '@/features/auth/auth-logo';
import { LoginOtpForm } from '@/features/auth/login-otp-form';
import { AuthFormHeader } from '@/features/auth/auth-form-header';
import { z } from 'zod';
import { ImageCard } from '@/features/auth/image-card';
import { useTranslation } from '@dropit/i18n';

export const Route = createFileRoute('/_auth/login/otp')({
  validateSearch: z.object({
    email: z.string().email()
  }),
  component: LoginOtp,
})

function LoginOtp() {
  const { email } = Route.useSearch();
  const { redirectBasedOnRole } = useAuthRedirect();
  const { t } = useTranslation(['auth']);

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <ImageCard />

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <AuthLogo />

          <AuthFormHeader title={t('login.title')} description={t('login.otpDescription')} />

          <LoginOtpForm
            email={email}
            onSuccess={redirectBasedOnRole}
          />
        </div>
      </div>
    </div>
  );
}
