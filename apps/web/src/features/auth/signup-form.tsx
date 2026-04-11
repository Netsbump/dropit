import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@dropit/i18n';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type SignupFormData = {
  email: string;
  name: string;
  dataConsent: boolean;
};

interface SignupFormProps {
  onSuccess: () => void;
  showRedirect?: boolean;
  showTerms?: boolean;
}

export function SignupForm({
  onSuccess,
  showRedirect = true,
  showTerms = true,
}: SignupFormProps) {
  const { t } = useTranslation(['auth']);

  const formSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('common.validation.emailRequired') }),
    name: z.string().min(1, { message: t('common.validation.nameRequired') }),
    dataConsent: z.boolean().refine((val) => val === true, {
      message: t('signup.dataConsent.required'),
    }),
  }), [t]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      dataConsent: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (values: SignupFormData) => {
      return await api.access.requestAccess({ body: { email: values.email, name: values.name } });
    },
    onSuccess: () => {
      toast({
        title: t('signup.toast.success.title'),
        description: t('signup.toast.success.description'),
      });
      onSuccess();
    },
  });

  function onSubmit(values: SignupFormData) {
    signupMutation.mutate(values);
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
          {t('signup.redirect').split('{{link}}')[0]}
          <a
            href="/login"
            className="text-purple-600 font-medium hover:text-purple-700 hover:underline"
          >
            {t('signup.redirectLink')}
          </a>
        </p>
      )}

      {showTerms && (
        <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
          {t('signup.terms.prefix')}{' '}
          <a
            href="/terms"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            {t('signup.termsLink')}
          </a>
          {t('signup.terms.suffix')}
        </p>
      )}
    </div>
  );
} 
