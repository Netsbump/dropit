import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginEmailForm } from '@/features/auth/login-email-form';
import { BicepsFlexed } from 'lucide-react';
import loginImage from '@/assets/images/hero-pages/login.svg';

export const Route = createLazyFileRoute('/_auth/login/')({
  component: Login,
});

function Login() {
  const navigate = useNavigate()
  const handleSuccess = (email: string) => {
    navigate({ to: '/login/otp', search: { email } });
  }
  const handleError = () => {
    console.log('network error i guess')
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

          <LoginEmailForm
            onSuccess={handleSuccess}
            onError={handleError}
            showRedirect={true}
          />
        </div>
      </div>
    </div>
  );
}
