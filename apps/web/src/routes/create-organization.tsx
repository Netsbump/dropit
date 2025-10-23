import { createFileRoute, redirect } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { BicepsFlexed } from 'lucide-react';

export const Route = createFileRoute('/create-organization')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { toast } = useToast();

  const createOrganizationSchema = z.object({
    name: z.string().min(2, t('create_organization.validation.name_min')),
    slug: z.string().min(2, t('create_organization.validation.slug_min')),
    description: z.string().optional(),
  });
  
  type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;
  
  const form = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const result = await authClient.organization.create(data);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: t('create_organization.success.title'),
        description: t('create_organization.success.description'),
      });
      navigate({ to: '/dashboard' });
    },
    onError: (error) => {
      toast({
        title: t('create_organization.error.title'),
        description: error.message || t('create_organization.error.description'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateOrganizationData) => {
    createOrganizationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm">
          <CardHeader className="text-center p-8 pb-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <BicepsFlexed className="h-8 w-8 stroke-[2.5] text-purple-700" />
              <span className="text-xl font-bold text-purple-700">Dropit</span>
            </div>

            <CardTitle className="text-2xl text-gray-800">{t('create_organization.title')}</CardTitle>
            <CardDescription className="text-base text-gray-600">
              {t('create_organization.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t('create_organization.fields.name')}</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder={t('create_organization.fields.name_placeholder')}
                  className="h-11"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t('create_organization.fields.slug')}</Label>
                <Input
                  id="slug"
                  {...form.register('slug')}
                  placeholder={t('create_organization.fields.slug_placeholder')}
                  className="h-11"
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('create_organization.fields.description')}</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder={t('create_organization.fields.description_placeholder')}
                  rows={3}
                  className="resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={createOrganizationMutation.isPending}
              >
                {createOrganizationMutation.isPending
                  ? t('common.loading')
                  : t('create_organization.button')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 