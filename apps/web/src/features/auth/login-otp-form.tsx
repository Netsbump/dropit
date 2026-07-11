import { useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorKey } from '@/lib/auth-errors';
import { Button } from '@/components/ui/button';
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

type LoginOtpFormData = {
  otp: string;
};

interface LoginOtpFormProps {
  email: string;
  onSuccess: () => void;
}

export function LoginOtpForm({ email, onSuccess }: LoginOtpFormProps) {
  const { t } = useTranslation(['auth']);
  const queryClient = useQueryClient();

  const otpFormSchema = useMemo(
    () =>
      z.object({
        otp: z
          .string()
          .length(6, { message: t('login.validation.otpRequired') }),
      }),
    [t]
  );

  const otpForm = useForm<LoginOtpFormData>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  const loginOtpMutation = useMutation({
    mutationFn: async (values: LoginOtpFormData) => {
      const { data, error } = await authClient.signIn.emailOtp({
        email: email,
        otp: values.otp,
      });
      if (error) throw new Error(error.code ?? error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('login.toast.success.title'),
        description: t('login.toast.success.description'),
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: t('login.toast.error.title'),
        description: t(getAuthErrorKey(error.message)),
        variant: 'destructive',
      });
    },
  });

  function onSubmitOtp(values: LoginOtpFormData) {
    loginOtpMutation.mutate(values);
  }

  return (
    <div>
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onSubmitOtp)}
          className="space-y-4"
        >
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.otp')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('common.placeholders.otp')}
                    inputMode="numeric"
                    maxLength={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loginOtpMutation.isPending}
          >
            {loginOtpMutation.isPending
              ? t('login.otpButtonLoading')
              : t('login.otpButton')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
