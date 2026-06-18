import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@dropit/i18n';
import {
  createAdminInvitationSchema,
  type InvitableOrganizationRole,
} from '@dropit/schemas';
import type { ReactNode } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { z } from 'zod';

interface OrganizationOption {
  id: string;
  name: string;
}

export interface CreateAdminInvitationInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  organizationRole: InvitableOrganizationRole;
}

interface CreateAdminInvitationFormProps {
  formId: string;
  organizations: OrganizationOption[];
  onSubmit: (input: CreateAdminInvitationInput) => void;
}

type CreateAdminInvitationFormValues = z.infer<
  typeof createAdminInvitationSchema
>;

function SelectField({
  field,
  placeholder,
  children,
}: {
  field: ControllerRenderProps<CreateAdminInvitationFormValues>;
  placeholder?: string;
  children: ReactNode;
}) {
  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function CreateAdminInvitationForm({
  formId,
  organizations,
  onSubmit,
}: CreateAdminInvitationFormProps) {
  const { t } = useTranslation(['admin']);
  const form = useForm<CreateAdminInvitationFormValues>({
    resolver: zodResolver(createAdminInvitationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organizationId: '',
      organizationRole: 'member' satisfies InvitableOrganizationRole,
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        className="space-y-3"
        autoComplete="off"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin:users.modal.labels.first_name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  name="firstName"
                  autoComplete="given-name"
                  placeholder={t('admin:users.modal.placeholders.first_name')}
                />
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
              <FormLabel>{t('admin:users.modal.labels.last_name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  name="lastName"
                  autoComplete="family-name"
                  placeholder={t('admin:users.modal.placeholders.last_name')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin:users.modal.labels.email')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('admin:users.modal.placeholders.email')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizationRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('admin:users.modal.labels.organization_role')}
              </FormLabel>
              <SelectField field={field}>
                <SelectItem value="member">
                  {t('admin:users.roles.athlete')}
                </SelectItem>
                <SelectItem value="admin">
                  {t('admin:users.roles.coach')}
                </SelectItem>
              </SelectField>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('admin:users.modal.labels.organization')}
              </FormLabel>
              <SelectField
                field={field}
                placeholder={t('admin:users.modal.organization_placeholder')}
              >
                {organizations.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectField>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
