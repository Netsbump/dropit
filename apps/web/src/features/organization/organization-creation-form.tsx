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

const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères'),
  description: z.string().optional(),
});

type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export function OrganizationCreationForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        title: t('organization.create.success.title'),
        description: t('organization.create.success.description'),
      });
      navigate({ to: '/dashboard' });
    },
    onError: (error) => {
      toast({
        title: t('organization.create.error.title'),
        description: error.message || t('organization.create.error.description'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateOrganizationData) => {
    createOrganizationMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('organization.create.title')}</CardTitle>
        <CardDescription>
          {t('organization.create.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('organization.fields.name')}</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder={t('organization.fields.name_placeholder')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t('organization.fields.slug')}</Label>
            <Input
              id="slug"
              {...form.register('slug')}
              placeholder={t('organization.fields.slug_placeholder')}
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-red-600">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('organization.fields.description')}</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder={t('organization.fields.description_placeholder')}
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createOrganizationMutation.isPending}
          >
            {createOrganizationMutation.isPending
              ? t('common.loading')
              : t('organization.create.button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 