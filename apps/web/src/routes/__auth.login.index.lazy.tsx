import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/login-form';
import { BicepsFlexed } from 'lucide-react';
import loginImage from '@/assets/images/hero-pages/login.svg';
import { useAuthRedirect } from '@/features/auth/use-auth-redirect';

export const Route = createLazyFileRoute('/__auth/login/')({
  component: Login,
});

function Login() {
  const { redirectBasedOnRole } = useAuthRedirect();

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

          <LoginForm
            onSuccess={redirectBasedOnRole}
            showRedirect={true}
          />
        </div>
      </div>
    </div>
  );
}
