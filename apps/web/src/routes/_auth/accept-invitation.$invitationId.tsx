import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@dropit/i18n';
import { LoginEmailForm } from '@/features/auth/login-email-form';
import { SignupForm } from '@/features/auth/signup-form';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorKey } from '@/lib/auth-errors';

export const Route = createFileRoute('/_auth/accept-invitation/$invitationId')({
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitationId } = useParams({ from: '/_auth/accept-invitation/$invitationId' });
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
        throw new Error(response.error.code ?? response.error.message);
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
      // Coaches (admin/owner) are not invited
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
        throw new Error(response.error.code ?? response.error.message);
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
          <span>{t('acceptInvitation.loading')}</span>
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
              <LoginEmailForm
                onSuccess={handleAuthSuccess}
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
                {t(getAuthErrorKey(acceptInvitationMutation.error?.message))}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
