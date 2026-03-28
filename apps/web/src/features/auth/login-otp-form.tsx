
import { useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input'; import { useTranslation } from "@dropit/i18n";

type LoginOtpFormData = {
  otp: string
}

interface LoginOtpFormProps {
  email: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function LoginOtpForm({
  email,
  onSuccess,
  onError,
}: LoginOtpFormProps) {
  const { t } = useTranslation(['auth']);

  const otpFormSchema = useMemo(() => z.object({
    otp: z.string().length(6, { message: t('login.validation.otpRequired') }),
  }), [t]);

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
      return data
    },
    onSuccess: () => {
      toast({
        title: t('login.toast.success.title'),
        description: t('login.toast.success.description'),
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: t('login.toast.error.title'),
        description: t(getAuthErrorKey(error.message)),
        variant: 'destructive',
      });
      onError(error);
    },
  })

  function onSubmitOtp(values: LoginOtpFormData) {
    loginOtpMutation.mutate(values);
  }

  return (
    <div>
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('login.title')}</h1>
        <p className="text-sm text-gray-600">{t('login.otpDescription')}</p>
      </div>
      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
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

