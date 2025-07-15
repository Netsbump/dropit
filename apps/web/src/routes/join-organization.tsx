import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "@dropit/i18n";
import { useToast } from "@/shared/hooks/use-toast";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute('/join-organization')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: JoinOrganizationPage,
});

function JoinOrganizationPage() {
  const { t } = useTranslation('onboarding');
  const { toast } = useToast();
  const navigate = useNavigate();

  const joinOrganizationSchema = z.object({
    code: z.string().min(1, t('join_organization.validation.code_required')),
  });
  
  type JoinOrganizationData = z.infer<typeof joinOrganizationSchema>;

  const form = useForm<JoinOrganizationData>({
    resolver: zodResolver(joinOrganizationSchema),
    defaultValues: {
      code: '',
    },
  });

  const joinOrganizationMutation = useMutation({
    mutationFn: async (data: JoinOrganizationData) => {
      // TODO: Appeler l'API pour valider le code d'invitation
      const response = await fetch('/api/invitations/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('join_organization.error.validation_failed'));
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('join_organization.success.title'),
        description: t('join_organization.success.description'),
      });
      navigate({ to: '/download-app' });
    },
    onError: (error) => {
      toast({
        title: t('join_organization.error.title'),
        description: error.message || t('join_organization.error.description'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: JoinOrganizationData) => {
    joinOrganizationMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t('join_organization.title')}</CardTitle>
          <CardDescription>
            {t('join_organization.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">{t('join_organization.fields.code')}</Label>
              <Input
                id="code"
                {...form.register('code')}
                placeholder={t('join_organization.fields.code_placeholder')}
                className="text-center text-lg font-mono tracking-wider"
                autoComplete="off"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={joinOrganizationMutation.isPending}
            >
              {joinOrganizationMutation.isPending ? (
                t('join_organization.loading')
              ) : (
                <>
                  {t('join_organization.button')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">{t('join_organization.help.no_code')}</p>
              <p>
                {t('join_organization.help.contact_coach')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
