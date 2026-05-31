import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@dropit/i18n';
import type { InvitableOrganizationRole } from '@dropit/schemas';
import { useState } from 'react';

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

export function CreateAdminInvitationForm({
  formId,
  organizations,
  onSubmit,
}: CreateAdminInvitationFormProps) {
  const { t } = useTranslation(['admin']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [organizationRole, setOrganizationRole] =
    useState<InvitableOrganizationRole>('member');

  return (
    <form
      id={formId}
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          firstName,
          lastName,
          email,
          organizationId,
          organizationRole,
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="firstName">
          {t('admin:users.modal.labels.first_name')}
        </Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t('admin:users.modal.placeholders.first_name')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">
          {t('admin:users.modal.labels.last_name')}
        </Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t('admin:users.modal.placeholders.last_name')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('admin:users.modal.labels.email')}</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('admin:users.modal.placeholders.email')}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('admin:users.modal.labels.organization_role')}</Label>
        <Select
          value={organizationRole}
          onValueChange={(value: InvitableOrganizationRole) =>
            setOrganizationRole(value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">
              {t('admin:users.roles.athlete')}
            </SelectItem>
            <SelectItem value="admin">
              {t('admin:users.roles.coach')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('admin:users.modal.labels.organization')}</Label>
        <Select value={organizationId} onValueChange={setOrganizationId}>
          <SelectTrigger>
            <SelectValue
              placeholder={t('admin:users.modal.organization_placeholder')}
            />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((organization) => (
              <SelectItem key={organization.id} value={organization.id}>
                {organization.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
