import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@dropit/i18n';
import { LoginForm } from '@/shared/components/auth/login-form';
import { SignupForm } from '@/shared/components/auth/signup-form';

export const Route = createFileRoute('/__auth/accept-invitation/$invitationId')({
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitationId } = useParams({ from: '/__auth/accept-invitation/$invitationId' });
  const navigate = useNavigate();
  const { t } = useTranslation(['auth']);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Vérifier l'invitation
  const { data: invitation, isLoading: isLoadingInvitation, error: invitationError } = useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: async () => {
      // TODO: Implémenter l'API d'invitation quand elle sera disponible
      // Pour l'instant, on simule une invitation valide
      return {
        id: invitationId,
        organization: { name: 'Halterophilie Club' },
        inviter: { user: { name: 'Jean Dupont' } },
        status: 'pending',
      };
    },
    retry: false,
  });

  console.log(invitation);

  // Mutation d'acceptation d'invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implémenter l'API d'acceptation d'invitation
      console.log('Accepting invitation:', invitationId);
      return { success: true };
    },
    onSuccess: () => {
      // Rediriger vers le dashboard
      navigate({ to: '/dashboard' });
    },
  });

  const handleAuthSuccess = () => {
    // Après connexion/inscription réussie, accepter l'invitation
    acceptInvitationMutation.mutate();
  };

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    // L'erreur est déjà gérée par les composants LoginForm/SignupForm
  };

  // États de chargement
  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('acceptInvitation.loading')}</span>
        </div>
      </div>
    );
  }

  // Erreur d'invitation
  if (invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              {t('acceptInvitation.invalid.title')}
            </CardTitle>
            <CardDescription>
              {t('acceptInvitation.invalid.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/login' })}
              className="w-full"
            >
              {t('acceptInvitation.invalid.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            {t('acceptInvitation.title', { organizationName: invitation?.organization?.name })}
          </CardTitle>
          <CardDescription>
            {t('acceptInvitation.description', { inviterName: invitation?.inviter?.user?.name })}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('acceptInvitation.tabs.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('acceptInvitation.tabs.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                showAlternative={false}
                showRedirect={false}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm 
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                showAlternative={false}
                showRedirect={false}
                showTerms={true}
              />
            </TabsContent>
          </Tabs>

          {acceptInvitationMutation.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {acceptInvitationMutation.error.message || t('acceptInvitation.acceptError')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 