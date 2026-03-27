import { createFileRoute } from '@tanstack/react-router'
import { BicepsFlexed } from 'lucide-react';
import loginImage from '@/assets/images/hero-pages/login.svg';
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';
import { LoginOtpForm } from '@/features/auth/login-otp-form';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/login/otp')({
  validateSearch: z.object({
    email: z.string().email()
  }),
  component: LoginOtp,
})

function LoginOtp() {
  const { email } = Route.useSearch();
  const { redirectBasedOnRole } = useAuthRedirect();
  const handleError = (error: Error) => {
    console.log(error);
  }

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <div className="hidden lg:flex items-center justify-center py-12">
        <img
          src={loginImage}
          alt="Login illustration"
          className="w-full h-full max-h-[800px] object-contain"
        />
      </div>

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <BicepsFlexed className="h-8 w-8 stroke-[2.5] text-purple-700" />
            <span className="text-xl font-bold text-purple-700">Dropit</span>
          </div>

          <LoginOtpForm
            email={email}
            onSuccess={redirectBasedOnRole}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}
