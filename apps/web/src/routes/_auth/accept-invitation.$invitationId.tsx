import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { useTranslation } from '@dropit/i18n';
import { api } from '@/lib/api';

export const Route = createFileRoute('/_auth/accept-invitation/$invitationId')({
  loader: async ({ params }) => {
    const response = await api.onboarding.acceptInvitation({
      params: { invitationId: params.invitationId },
      body: {},
    });

    if (response.status === 200) {
      throw redirect({
        to:
          response.body.organizationRole === 'admin'
            ? '/login'
            : '/download-app',
      });
    }

    return { error: (response.body as { message: string }).message };
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { error } = Route.useLoaderData();
  const { t } = useTranslation(['auth']);

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
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    </div>
  );
}
