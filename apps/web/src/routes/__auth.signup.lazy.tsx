import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../shared/components/ui/form';
import { Input } from '../shared/components/ui/input';
import { Separator } from '../shared/components/ui/separator';
import { useTranslation } from '@dropit/i18n';

function getFormSchema(t: any) {
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

export const Route = createLazyFileRoute('/__auth/signup')({
  component: Signup,
});

function Signup() {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();

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
      navigate({ to: '/dashboard', replace: true });
    },
    onError: (error) => {
      toast({
        title: t('signup.toast.error.title'),
        description:
          error instanceof Error ? error.message : t('signup.toast.error.description'),
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: SignupFormData) {
    signupMutation.mutate(values);
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('signup.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('signup.description')}
          </p>
        </div>

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

        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('signup.redirect', { link: t('signup.redirectLink') })}{' '}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.redirectLink')}
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('signup.terms.prefix')}{' '}
          <Link
            to="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.termsLink')}
          </Link>{' '}
          {t('signup.terms.middle')}{' '}
          <Link
            to="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('signup.privacyLink')}
          </Link>
          {t('signup.terms.suffix')}
        </p>
      </div>
    </div>
  );
}
