import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Github } from 'lucide-react';
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
import { Separator } from '@/shared/components/ui/separator';
import { useTranslation } from '@dropit/i18n';

function getFormSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email({ message: t('common.validation.emailRequired') }),
    password: z
      .string()
      .min(6, { message: t('common.validation.passwordMinLength') }),
    name: z.string().min(1, { message: t('common.validation.nameRequired') }),
  });
}

type SignupFormData = {
  email: string;
  password: string;
  name: string;
};

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showAlternative?: boolean;
  showRedirect?: boolean;
  showTerms?: boolean;
  className?: string;
}

export function SignupForm({ 
  onSuccess, 
  onError, 
  showAlternative = true, 
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

      {showAlternative && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('signup.alternative')}
              </span>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            {t('signup.githubButton')}
          </Button>
        </>
      )}

      {showRedirect && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('signup.redirect', { link: t('signup.redirectLink') })}{' '}
          <a
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.redirectLink')}
          </a>
        </p>
      )}

      {showTerms && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('signup.terms.prefix')}{' '}
          <a
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.termsLink')}
          </a>{' '}
          {t('signup.terms.middle')}{' '}
          <a
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.privacyLink')}
          </a>
          {t('signup.terms.suffix')}
        </p>
      )}
    </div>
  );
} 