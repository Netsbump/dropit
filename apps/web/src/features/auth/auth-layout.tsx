import type { ReactNode } from 'react';
import { AuthLogo } from '@/features/auth/auth-logo';
import { ImageCard } from '@/features/auth/image-card';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full max-w-app mx-auto min-h-screen grid lg:grid-cols-2 gap-20 p-8">
      <ImageCard />

      <div className="w-full max-w-md mx-auto flex items-center">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm p-8">
          <AuthLogo />
          {children}
        </div>
      </div>
    </div>
  );
}
