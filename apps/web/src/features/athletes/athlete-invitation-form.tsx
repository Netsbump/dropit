import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/shared/hooks/use-toast';
import { Mail, UserPlus, Send } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type AthleteInvitationFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AthleteInvitationForm({
  onSuccess,
  onCancel,
}: AthleteInvitationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(['athletes']);

  // Schéma de validation pour l'invitation
  const invitationSchema = z.object({
    email: z.string().email(t('invitation.email_required')),
  });

  type InvitationFormData = z.infer<typeof invitationSchema>;

  const { mutate: sendInvitationMutation } = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const response = await authClient.organization.inviteMember({
        email: data.email,
        role: 'member', // Toujours member (athlète)
      });

      if (response.error) {
        throw new Error(response.error.message || t('invitation.error_description'));
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: t('invitation.success_title'),
        description: t('invitation.success_description', { email: data.email }),
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t('invitation.error_title'),
        description: error instanceof Error ? error.message : t('invitation.error_description'),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: InvitationFormData) {
    try {
      setIsLoading(true);
      sendInvitationMutation(values);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec icône et description */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">{t('invitation.title')}</h3>
        <p className="text-sm text-gray-600">
          {t('invitation.description')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email - Champ principal */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('invitation.email')} <span className="text-destructive ml-1">*</span>
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

          {/* Informations sur le processus */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{t('invitation.how_it_works')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('invitation.how_it_works_steps.0')}</li>
              <li>• {t('invitation.how_it_works_steps.1')}</li>
              <li>• {t('invitation.how_it_works_steps.2')}</li>
              <li>• {t('invitation.how_it_works_steps.3')}</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
            >
              {t('invitation.button_cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('invitation.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('invitation.button_send')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 