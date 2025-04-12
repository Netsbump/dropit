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
import { useTranslation } from '@dropit/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthday: z.string().min(1, 'Birthday is required'),
  country: z.string().optional(),
});

interface AthleteCreationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AthleteCreationForm({
  onSuccess,
  onCancel,
}: AthleteCreationFormProps) {
  const { t } = useTranslation(['athletes']);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthday: '',
      country: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: Implement API call to create athlete
      console.log(values);
      onSuccess();
    } catch (error) {
      console.error('Failed to create athlete:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.first_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.first_name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.last_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.last_name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.birthday')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.country')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.country_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('form.button_cancel')}
          </Button>
          <Button type="submit">{t('form.button_create')}</Button>
        </div>
      </form>
    </Form>
  );
} 