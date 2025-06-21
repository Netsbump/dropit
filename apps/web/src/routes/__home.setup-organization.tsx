import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@dropit/i18n';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { OrganizationCreationForm } from '../features/organization/organization-creation-form';

export const Route = createFileRoute('/__home/setup-organization')({
  component: SetupOrganizationPage,
});

function SetupOrganizationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        navigate({ to: '/login' });
        return;
      }
      
      // Vérifier si l'utilisateur est un coach
      // Pour l'instant, on va simplifier et laisser passer
      // TODO: Implémenter la vérification du rôle quand les types seront corrects
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('organization.setup.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('organization.setup.description')}
          </p>
        </div>
        <OrganizationCreationForm />
      </div>
    </div>
  );
} 