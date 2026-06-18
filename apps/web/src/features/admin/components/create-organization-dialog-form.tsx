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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateOrganization } from '../hooks/use-create-organization';

type CreateOrganizationDialogFormProps = {
  formId: string;
  onSuccess: () => void;
};

export function CreateOrganizationDialogForm({
  formId,
  onSuccess,
}: CreateOrganizationDialogFormProps) {
  const { t } = useTranslation(['admin']);
  const createOrganization = useCreateOrganization();

  const schema = z.object({
    name: z.string().min(1, t('admin:organizations.validation.name_required')),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createOrganization.mutateAsync({ name: values.name.trim() });
    form.reset();
    onSuccess();
  });

  return (
    <Form {...form}>
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin:organizations.fields.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('admin:organizations.create_placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
