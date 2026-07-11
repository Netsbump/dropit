import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/hooks/use-toast';
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

type LoginEmailFormData = {
  email: string;
};

interface LoginEmailFormProps {
  onSuccess: (email: string) => void;
  showRedirect?: boolean;
}

export function LoginEmailForm({
  onSuccess,
  showRedirect = true,
}: LoginEmailFormProps) {
  const { t } = useTranslation(['auth']);
  const queryClient = useQueryClient();

  const emailFormSchema = z.object({
    email: z.string().email({ message: t('common.validation.emailRequired') }),
  });

  const emailForm = useForm<LoginEmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const loginEmailMutation = useMutation({
    mutationFn: async (values: LoginEmailFormData) => {
      await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'sign-in',
      });
      return values.email;
    },
    onSuccess: (email: string) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      onSuccess(email);
    },
    onError: (error: Error) => {
      toast({
        title: t('login.toast.error.title'),
        description: t(getAuthErrorKey(error.message)),
        variant: 'destructive',
      });
    },
  });

  function onSubmitEmail(values: LoginEmailFormData) {
    loginEmailMutation.mutate(values);
  }

  return (
    <div>
      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onSubmitEmail)}
          className="space-y-4"
        >
          <FormField
            control={emailForm.control}
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
}
