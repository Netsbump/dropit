import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
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
  });
}

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showAlternative?: boolean;
  showRedirect?: boolean;
  className?: string;
}

export function LoginForm({ 
  onSuccess, 
  onError, 
  showAlternative = true, 
  showRedirect = true,
  className = ""
}: LoginFormProps) {
  const { t } = useTranslation(['auth']);

  const formSchema = getFormSchema(t);

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
        throw new Error(response.error.message || 'Invalid email or password');
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
        description: error.message || t('login.toast.error.description'),
        variant: 'destructive',
      });
      onError?.(error);
    },
  });

  function onSubmit(values: LoginFormData) {
    loginMutation.mutate(values);
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
                <FormLabel>{t('login.email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('common.placeholders.email')} {...field} />
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
                  <Input type="password" placeholder={t('common.placeholders.password')} {...field} />
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

      {showAlternative && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('login.alternative')}
              </span>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            {t('login.githubButton')}
          </Button>
        </>
      )}

      {showRedirect && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('login.redirect', { link: t('login.redirectLink') })}{' '}
          <a
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('login.redirectLink')}
          </a>
        </p>
      )}
    </div>
  );
} 