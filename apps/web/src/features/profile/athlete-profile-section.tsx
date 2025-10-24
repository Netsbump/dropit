import { useState, useEffect } from 'react';
import { useTranslation } from '@dropit/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const getAthleteFormSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, { message: t('common:validation.nameRequired') }),
    lastName: z.string().min(1, { message: t('common:validation.nameRequired') }),
    birthday: z.string().optional(),
    country: z.string().optional(),
  });

type AthleteFormData = {
  firstName: string;
  lastName: string;
  birthday?: string;
  country?: string;
};

export function AthleteProfileSection() {
  const { t } = useTranslation(['profile', 'common']);
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const athleteFormSchema = getAthleteFormSchema(t);

  // Fetch athlete profile by athleteId from session
  // @ts-expect-error - athleteId is an additional field configured in better-auth
  const athleteId = session?.session?.athleteId as string | undefined;

  const { data: athlete, isLoading } = useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;
      const response = await api.athlete.getAthlete({ params: { id: athleteId } });
      if (response.status !== 200) {
        throw new Error('Failed to load athlete profile');
      }
      return response.body;
    },
    enabled: !!athleteId,
  });

  // Create athlete mutation
  const { mutate: createAthlete, isPending: isCreatingAthlete } = useMutation({
    mutationFn: async (data: AthleteFormData) => {
      const response = await api.athlete.createAthlete({
        body: {
          ...data,
          birthday: data.birthday || undefined,
        },
      });
      if (response.status !== 201) {
        throw new Error('Failed to create athlete profile');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: t('profile:athlete.toast.create_success'),
      });
      queryClient.invalidateQueries({ queryKey: ['athlete'] });
      setIsCreating(false);
      // Refresh session to get new athleteId
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: t('profile:athlete.toast.create_error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update athlete mutation
  const { mutate: updateAthlete, isPending: isUpdatingAthlete } = useMutation({
    mutationFn: async (data: AthleteFormData) => {
      if (!athleteId) throw new Error('No athlete ID');
      const response = await api.athlete.updateAthlete({
        params: { id: athleteId },
        body: {
          ...data,
          birthday: data.birthday || undefined,
        },
      });
      if (response.status !== 200) {
        throw new Error('Failed to update athlete profile');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: t('profile:athlete.toast.update_success'),
      });
      queryClient.invalidateQueries({ queryKey: ['athlete', athleteId] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: t('profile:athlete.toast.update_error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete athlete mutation
  const { mutate: deleteAthlete, isPending: isDeletingAthlete } = useMutation({
    mutationFn: async () => {
      if (!athleteId) throw new Error('No athlete ID');
      const response = await api.athlete.deleteAthlete({
        params: { id: athleteId },
      });
      if (response.status !== 200) {
        throw new Error('Failed to delete athlete profile');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: t('profile:athlete.toast.delete_success'),
      });
      queryClient.invalidateQueries({ queryKey: ['athlete'] });
      setDeleteDialogOpen(false);
      // Refresh session to clear athleteId
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: t('profile:athlete.toast.delete_error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<AthleteFormData>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthday: '',
      country: '',
    },
  });

  // Update form when athlete data is loaded
  useEffect(() => {
    if (athlete) {
      form.reset({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        birthday: athlete.birthday
          ? new Date(athlete.birthday).toISOString().split('T')[0]
          : '',
        country: athlete.country || '',
      });
    }
  }, [athlete, form]);

  const onSubmit = (data: AthleteFormData) => {
    if (isCreating) {
      createAthlete(data);
    } else {
      updateAthlete(data);
    }
  };

  const handleCancel = () => {
    if (athlete) {
      form.reset({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        birthday: athlete.birthday
          ? new Date(athlete.birthday).toISOString().split('T')[0]
          : '',
        country: athlete.country || '',
      });
    }
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    form.reset({
      firstName: '',
      lastName: '',
      birthday: '',
      country: '',
    });
    setIsCreating(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-none">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No athlete profile
  if (!athlete && !isCreating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl shadow-none">{t('profile:athlete.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">
              {t('profile:athlete.no_profile.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('profile:athlete.no_profile.description')}
            </p>
            <Button onClick={handleCreateClick}>
              {t('profile:athlete.no_profile.create_button')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">{t('profile:athlete.title')}</CardTitle>
          {!isEditing && !isCreating && (
            <CardDescription>
              {athlete?.firstName} {athlete?.lastName}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!isEditing && !isCreating ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t('profile:athlete.view.first_name')}
                </p>
                <p className="text-base">{athlete?.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t('profile:athlete.view.last_name')}
                </p>
                <p className="text-base">{athlete?.lastName}</p>
              </div>
              {athlete?.birthday && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t('profile:athlete.view.birthday')}
                  </p>
                  <p className="text-base">
                    {new Date(athlete.birthday).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {athlete?.country && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t('profile:athlete.view.country')}
                  </p>
                  <p className="text-base">{athlete.country}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)}>
                  {t('profile:athlete.view.edit_button')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {t('profile:athlete.view.delete_button')}
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('profile:athlete.form.first_name_label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'profile:athlete.form.first_name_placeholder'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('profile:athlete.form.last_name_label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'profile:athlete.form.last_name_placeholder'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('profile:athlete.form.birthday_label')}
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('profile:athlete.form.country_label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('profile:athlete.form.country_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isCreatingAthlete || isUpdatingAthlete}
                  >
                    {isCreatingAthlete
                      ? t('profile:athlete.form.creating_button')
                      : isUpdatingAthlete
                        ? t('profile:athlete.form.saving_button')
                        : isCreating
                          ? t('profile:athlete.form.create_button')
                          : t('profile:athlete.form.save_button')}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {t('profile:athlete.form.cancel_button')}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile:athlete.delete.dialog_title')}</DialogTitle>
            <DialogDescription>
              {t('profile:athlete.delete.dialog_description')}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('profile:athlete.delete.warning')}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingAthlete}
            >
              {t('profile:athlete.delete.cancel_button')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAthlete()}
              disabled={isDeletingAthlete}
            >
              {t('profile:athlete.delete.confirm_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
