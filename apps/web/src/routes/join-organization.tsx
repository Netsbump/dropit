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
import { BicepsFlexed, ArrowRight } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center p-8" style={{
      background: 'linear-gradient(135deg, rgba(200, 180, 255, 0.5) 0%, rgba(180, 200, 255, 0.4) 20%, rgba(255, 200, 220, 0.3) 40%, rgba(255, 220, 200, 0.35) 60%, rgba(255, 200, 220, 0.4) 80%, rgba(220, 180, 255, 0.5) 100%)'
    }}>
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm">
          <CardHeader className="text-center p-8 pb-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <BicepsFlexed className="h-8 w-8 stroke-[2.5] text-purple-600" />
              <span className="text-xl font-bold text-purple-600">Dropit</span>
            </div>

            <CardTitle className="text-2xl text-gray-800">{t('join_organization.title')}</CardTitle>
            <CardDescription className="text-base text-gray-600">
              {t('join_organization.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
              className="w-full h-11 text-base bg-orange-500 hover:bg-orange-600 text-white shadow hover:shadow-md transition-shadow"
              disabled={joinOrganizationMutation.isPending}
            >
              {joinOrganizationMutation.isPending ? (
                t('join_organization.loading')
              ) : (
                <>
                  {t('join_organization.button')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">{t('join_organization.help.no_code')}</p>
              <p className="text-xs text-gray-500">
                {t('join_organization.help.contact_coach')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
