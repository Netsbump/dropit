import { useState } from 'react';
import { useTranslation } from '@dropit/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from '@/shared/hooks/use-toast';
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
import { Skeleton } from '@/shared/components/ui/skeleton';

const getUpdateUserSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, { message: t('common:validation.nameRequired') }),
    email: z.string().email({ message: t('common:validation.emailRequired') }),
  });

type UpdateUserFormData = {
  name: string;
  email: string;
};

export function UserProfileSection() {
  const { t } = useTranslation(['profile', 'common']);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const updateUserSchema = getUpdateUserSchema(t);

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.user.getMe();
      if (response.status !== 200) {
        throw new Error('Failed to load user profile');
      }
      return response.body;
    },
  });

  // Update user mutation
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UpdateUserFormData) => {
      const response = await api.user.updateMe({
        body: data,
      });
      if (response.status !== 200) {
        throw new Error('Failed to update user profile');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: t('profile:user.toast.update_success'),
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: t('profile:user.toast.update_error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Update form when user data is loaded
  useState(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      });
    }
  });

  const onSubmit = (data: UpdateUserFormData) => {
    updateUser(data);
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t('profile:user.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('profile:user.description')}</p>
      </div>
      <div>
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t('profile:user.view.name')}
              </p>
              <p className="text-base">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t('profile:user.view.email')}
              </p>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t('profile:user.view.created_at')}
              </p>
              <p className="text-base">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              {t('profile:user.view.edit_button')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile:user.edit.name_label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('profile:user.edit.name_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile:user.edit.email_label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('profile:user.edit.email_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating
                    ? t('profile:user.edit.saving_button')
                    : t('profile:user.edit.save_button')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t('profile:user.edit.cancel_button')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
