import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import { useState } from 'react';
import { useCreateOrganization } from '../hooks/use-create-organization';

export function CreateOrganizationForm() {
  const { t } = useTranslation('common');
  const [organizationName, setOrganizationName] = useState('');
  const createOrganization = useCreateOrganization();

  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="text-lg font-semibold">
        {t('admin.organizations.title')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('admin.organizations.description')}
      </p>
      <div className="mt-4 flex gap-2">
        <Input
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
          placeholder={t('admin.organizations.create_placeholder')}
        />
        <Button
          disabled={!organizationName.trim() || createOrganization.isPending}
          onClick={() => {
            createOrganization.mutate({ name: organizationName.trim() });
            setOrganizationName('');
          }}
        >
          {t('admin.organizations.create_button')}
        </Button>
      </div>
    </section>
  );
}
