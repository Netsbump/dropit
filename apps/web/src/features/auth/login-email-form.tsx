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

type LoginEmailFormData = {
  email: string
};

interface LoginEmailFormProps {
  onSuccess: (email: string) => void;
  onError: (error: Error) => void;
  showRedirect?: boolean;
}

export function LoginEmailForm({
  onSuccess,
  onError,
  showRedirect = true,
}: LoginEmailFormProps) {
  const { t } = useTranslation(['auth']);

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
        type: 'sign-in'
      });
      return values.email;
    },
    onSuccess: (email: string) => {
      onSuccess(email);
    },
    onError: (error: Error) => (
      onError(error)
    )
  });


  function onSubmitEmail(values: LoginEmailFormData) {
    loginEmailMutation.mutate(values);
  }

  return (
    <div>
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
}
