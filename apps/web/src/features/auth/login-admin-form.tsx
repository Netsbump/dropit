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
import { Input } from '@/components/ui/input';
import { useTranslation } from '@dropit/i18n';

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginAdminForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation(['auth']);

  const formSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .email({ message: t('common.validation.emailRequired') }),
        password: z
          .string()
          .min(6, { message: t('common.validation.passwordMinLength') }),
      }),
    [t]
  );

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormData) => {
      const response = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: '/dashboard',
        rememberMe: true,
      });

      if (response.error) {
        throw new Error(response.error.code ?? response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('login.toast.success.title'),
        description: t('login.toast.success.description'),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: t('login.toast.error.title'),
        description: t(getAuthErrorKey(error.message)),
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: LoginFormData) {
    loginMutation.mutate(values);
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.email')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('common.placeholders.email')}
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
                <FormLabel>{t('login.password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('common.placeholders.password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? t('login.buttonLoading')
              : t('login.button')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
