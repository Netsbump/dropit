import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@dropit/i18n';
import { LoginForm } from '@/shared/components/auth/login-form';
import { SignupForm } from '@/shared/components/auth/signup-form';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/__auth/accept-invitation/$invitationId')({
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitationId } = useParams({ from: '/__auth/accept-invitation/$invitationId' });
  const navigate = useNavigate();
  const { t } = useTranslation(['auth']);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
  const [invitationError, setInvitationError] = useState<Error | null>(null);



  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.organization.acceptInvitation({ 
        invitationId 
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: async () => {
      // Get session to determine role
      const session = await authClient.getSession();
      if (!session) {
        // Fallback to login if no session
        navigate({ to: '/login' });
        return;
      }

      // Redirection based on role
      // For athlete invitations, the role is always 'member'
      // Coaches (admin/owner) are not invited, they create the organization
      navigate({ to: '/download-app' });
    },
  });

  const handleAuthSuccess = async () => {
    // After successful login/signup, check invitation validity
    setIsCheckingInvitation(true);
    setInvitationError(null);
    
    try {
      const response = await authClient.organization.getInvitation({ query: { id: invitationId } });
      if (response.error) {
        throw new Error(response.error.message);
      }
      // If invitation is valid, accept it
      acceptInvitationMutation.mutate();
    } catch (error) {
      console.error('Failed to fetch invitation:', error);
      setInvitationError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsCheckingInvitation(false);
    }
  };



  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    // The error is already handled by the LoginForm/SignupForm components
  };

  // Show loading while fetching invitation after auth
  if (isCheckingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification de l'invitation...</span>
        </div>
      </div>
    );
  }

  // Show invitation errors after authentication
  if (invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Invitation invalide
            </CardTitle>
            <CardDescription>
              Cette invitation n'est plus valide. Veuillez recontacter votre coach pour obtenir une nouvelle invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/login' })}
              className="w-full"
            >
              Retour à la connexion
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
            {t('acceptInvitation.title')}
          </CardTitle>
          <CardDescription>
            {t('acceptInvitation.description')}
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
                showRedirect={false}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
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