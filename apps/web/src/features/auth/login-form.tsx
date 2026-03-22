import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
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
import { useState } from 'react';

function getEmailFormSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email({ message: t('common.validation.emailRequired') }),
  })
}

function getOtpFormSchema(t: (key: string) => string) {
  return z.object({
    otp: z.string().length(6, { message: t('login.validation.otpRequired') })
  })
}

type LoginEmailFormData = {
  email: string
};

type LoginOtpFormData = {
  otp: string
}

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showRedirect?: boolean;
  className?: string;
}

export function LoginForm({
  onSuccess,
  onError,
  showRedirect = true,
  className = ""
}: LoginFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const { t } = useTranslation(['auth']);

  const emailformSchema = getEmailFormSchema(t);
  const otpFormSchema = getOtpFormSchema(t);

  const emailForm = useForm<LoginEmailFormData>({
    resolver: zodResolver(emailformSchema),
    defaultValues: {
      email: '',
    },
  });

  const otpForm = useForm<LoginOtpFormData>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  const loginEmailMutation = useMutation({
    mutationFn: async (values: LoginEmailFormData) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'sign-in'
      });
      if (error) throw new Error(error.message);
      setEmail(values.email);
      return data;
    },
    onSettled: () => {
      setStep('otp');
    }
  });

  const loginOtpMutation = useMutation({
    mutationFn: async (values: LoginOtpFormData) => {
      const { data, error } = await authClient.signIn.emailOtp({
        email: email,
        otp: values.otp,
      });
      console.log(error)
      if (error) throw new Error(error.message);
      return data
    },
    onSuccess: () => {
      toast({
        title: t('login.toast.success.title'),
        description: t('login.toast.success.description'),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.log('onError call', error)
      toast({
        title: t('login.toast.error.title'),
        description: error.message || t('login.toast.error.description'),
        variant: 'destructive',
      });
      onError?.(error);
    },
  })

  function onSubmitEmail(values: LoginEmailFormData) {
    loginEmailMutation.mutate(values);
  }

  function onSubmitOtp(values: LoginOtpFormData) {
    loginOtpMutation.mutate(values);
  }

  if (step === 'email') return (
    <div className={className}>
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('login.title')}</h1>
        <p className="text-sm text-gray-600">{t('login.description')}</p>
      </div>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('common.placeholders.email')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loginEmailMutation.isPending}
          >
            {loginEmailMutation.isPending
              ? t('login.buttonLoading')
              : t('login.button')}
          </Button>
        </form>
      </Form>

      {showRedirect && (
        <p className="text-center text-sm text-gray-600 mt-6">
          {t('login.redirect').split('{{link}}')[0]}
          <a
            href="/signup"
            className="text-purple-600 font-medium hover:text-purple-700 hover:underline"
          >
            {t('login.redirectLink')}
          </a>
        </p>
      )}
    </div>
  );

  return (
    <div className={className}>
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('login.title')}</h1>
        <p className="text-sm text-gray-600">{t('login.otpDescription')}</p>
      </div>
      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
          <FormItem>
            <FormLabel>{t('login.otp')}</FormLabel>
            <FormControl>
              <Input
                {...otpForm.register('otp')}
                placeholder={t('common.placeholders.otp')}
                inputMode="numeric"
                maxLength={6}
              />
            </FormControl>
            {otpForm.formState.errors.otp && (
              <p className="text-sm font-medium text-destructive">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </FormItem>
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
