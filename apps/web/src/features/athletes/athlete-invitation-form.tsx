import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Mail, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { getAuthErrorKey } from '@/lib/auth-errors';

type AthleteInvitationFormProps = {
  formId: string;
  onSuccess: () => void;
};

export function AthleteInvitationForm({
  formId,
  onSuccess,
}: AthleteInvitationFormProps) {
  const { t } = useTranslation(['athletes']);
  const queryClient = useQueryClient();

  const invitationSchema = z.object({
    firstName: z.string().min(1, t('invitation.first_name_required')),
    lastName: z.string().min(1, t('invitation.last_name_required')),
    email: z.string().email(t('invitation.email_required')),
  });

  type InvitationFormData = z.infer<typeof invitationSchema>;

  const { mutate: sendInvitationMutation } = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const response = await api.athlete.inviteAthlete({
        body: data,
      });

      if (response.status !== 201) {
        throw new Error('Failed to send invitation');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: t('invitation.success_title'),
        description: t('invitation.success_description', { email: data.email }),
      });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t('invitation.error_title'),
        description: t(
          getAuthErrorKey(error instanceof Error ? error.message : undefined)
        ),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  async function onSubmit(values: InvitationFormData) {
    sendInvitationMutation(values);
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">{t('invitation.title')}</h3>
        <p className="text-sm text-gray-600">{t('invitation.description')}</p>
      </div>

      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('invitation.first_name')}{' '}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('invitation.first_name_placeholder')}
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
                  {t('invitation.last_name')}{' '}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('invitation.last_name_placeholder')}
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
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('invitation.email')}{' '}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('invitation.email_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {t('invitation.how_it_works')}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('invitation.how_it_works_steps.0')}</li>
              <li>• {t('invitation.how_it_works_steps.1')}</li>
              <li>• {t('invitation.how_it_works_steps.2')}</li>
              <li>• {t('invitation.how_it_works_steps.3')}</li>
            </ul>
          </div>
        </form>
      </Form>
    </div>
  );
}
