import { useState } from 'react';
import { useTranslation } from '@dropit/i18n';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const getDeleteAccountSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t('common:validation.emailRequired') }),
    password: z.string().min(1, { message: t('common:validation.passwordRequired') }),
    confirmation: z.string().min(1, { message: t('common:validation.confirmationRequired') }),
  });

type DeleteAccountFormData = {
  email: string;
  password: string;
  confirmation: string;
};

export function DangerZoneSection() {
  const { t } = useTranslation(['profile', 'common']);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteAccountSchema = getDeleteAccountSchema(t);

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmation: '',
    },
  });

  // Delete account mutation
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: async (data: DeleteAccountFormData) => {
      if (data.confirmation !== 'DELETE') {
        throw new Error(t('profile:danger.toast.confirmation_mismatch'));
      }
      const response = await api.user.deleteMe({
        body: data,
      });
      if (response.status !== 200) {
        throw new Error('Failed to delete account');
      }
      return response.body;
    },
    onSuccess: async () => {
      toast({
        title: t('profile:danger.toast.delete_account_success'),
      });
      // Sign out and redirect to login
      await authClient.signOut();
      navigate({ to: '/login' });
    },
    onError: (error) => {
      toast({
        title: t('profile:danger.toast.delete_account_error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: DeleteAccountFormData) => {
    deleteAccount(data);
  };

  const handleOpenDialog = () => {
    form.reset({
      email: '',
      password: '',
      confirmation: '',
    });
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-red-600">
            {t('profile:danger.title')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{t('profile:danger.description')}</p>
        </div>
        <div className="space-y-4">
          {/* Delete Account Section */}
          <div className="border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 mb-2">
              {t('profile:danger.delete_account.title')}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {t('profile:danger.delete_account.description')}
            </p>
            <Button variant="destructive" onClick={handleOpenDialog}>
              {t('profile:danger.delete_account.button')}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {t('profile:danger.delete_account.dialog_title')}
            </DialogTitle>
            <DialogDescription>
              {t('profile:danger.delete_account.dialog_description')}
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('profile:danger.delete_account.warning_title')}</AlertTitle>
            <AlertDescription>
              {t('profile:danger.delete_account.warning_text')}
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('profile:danger.delete_account.email_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t(
                          'profile:danger.delete_account.email_placeholder'
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('profile:danger.delete_account.password_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t(
                          'profile:danger.delete_account.password_placeholder'
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
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('profile:danger.delete_account.confirmation_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile:danger.delete_account.confirmation_placeholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeletingAccount}
                >
                  {t('profile:danger.delete_account.cancel_button')}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount
                    ? t('profile:danger.delete_account.deleting_button')
                    : t('profile:danger.delete_account.confirm_button')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
