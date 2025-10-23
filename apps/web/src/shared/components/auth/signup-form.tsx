import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useTranslation } from '@dropit/i18n';

function getFormSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email({ message: t('common.validation.emailRequired') }),
    password: z
      .string()
      .min(6, { message: t('common.validation.passwordMinLength') }),
    name: z.string().min(1, { message: t('common.validation.nameRequired') }),
    dataConsent: z.boolean().refine((val) => val === true, {
      message: t('signup.dataConsent.required'),
    }),
  });
}

type SignupFormData = {
  email: string;
  password: string;
  name: string;
  dataConsent: boolean;
};

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showRedirect?: boolean;
  showTerms?: boolean;
  className?: string;
}

export function SignupForm({
  onSuccess,
  onError,
  showRedirect = true,
  showTerms = true,
  className = ""
}: SignupFormProps) {
  const { t } = useTranslation(['auth']);

  const formSchema = getFormSchema(t);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      dataConsent: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (values: SignupFormData) => {
      const response = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: '/',
      });

      if (response.error) {
        throw new Error(response.error.message || 'Invalid email or password');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('signup.toast.success.title'),
        description: t('signup.toast.success.description'),
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: t('signup.toast.error.title'),
        description:
          error instanceof Error ? error.message : t('signup.toast.error.description'),
        variant: 'destructive',
      });
      onError?.(error);
    },
  });

  function onSubmit(values: SignupFormData) {
    signupMutation.mutate(values);
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('signup.email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('common.placeholders.email')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('signup.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('common.placeholders.name')} {...field} />
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
                <FormLabel>{t('signup.password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('common.placeholders.password')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-gray-700 cursor-pointer">
                    {t('signup.dataConsent.prefix')}{' '}
                    <a
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('signup.dataConsent.linkText')}
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending
              ? t('signup.buttonLoading')
              : t('signup.button')}
          </Button>
        </form>
      </Form>

      {showRedirect && (
        <p className="text-center text-sm text-gray-600 mt-6">
          Vous avez déjà un compte ?{' '}
          <a
            href="/login"
            className="text-purple-600 font-medium hover:text-purple-700 hover:underline"
          >
            Se connecter
          </a>
        </p>
      )}

      {showTerms && (
        <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
          En cliquant sur continuer, vous acceptez nos{' '}
          <a
            href="/terms"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a
            href="/privacy"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Politique de confidentialité
          </a>
          .
        </p>
      )}
    </div>
  );
} 