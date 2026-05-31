import { CreationDialog } from '@/components/shared/creation-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { CreateAdminInvitationForm } from './create-admin-invitation-form';
import { useAdminInvitationsQuery } from '../hooks/use-admin-invitations-query';
import { useAdminUsersQuery } from '../hooks/use-admin-users-query';
import { useCreateAdminInvitation } from '../hooks/use-create-admin-invitation';
import { useOrganizationsQuery } from '../hooks/use-organizations-query';
import { useTranslation } from '@dropit/i18n';
import { type ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export function UsersSection() {
  const { t } = useTranslation(['admin']);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'users' | 'invitations'>('users');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: organizations = [] } = useOrganizationsQuery();
  const { data: users = [], isLoading } = useAdminUsersQuery();
  const { data: invitations = [] } = useAdminInvitationsQuery();

  const createInvitation = useCreateAdminInvitation();

  const filtered = users.filter((user) => {
    const full =
      `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  const columns = useMemo<ColumnDef<(typeof users)[number]>[]>(
    () => [
      { accessorKey: 'firstName', header: t('admin:users.columns.first_name') },
      { accessorKey: 'lastName', header: t('admin:users.columns.last_name') },
      {
        accessorKey: 'organizationName',
        header: t('admin:users.columns.club'),
      },
      {
        accessorKey: 'organizationRole',
        header: t('admin:users.columns.role'),
        cell: ({ row }) =>
          row.original.organizationRole === 'admin'
            ? t('admin:users.roles.coach')
            : t('admin:users.roles.athlete'),
      },
      { accessorKey: 'email', header: t('admin:users.columns.email') },
      {
        accessorKey: 'birthday',
        header: t('admin:users.columns.birthday'),
        cell: ({ row }) =>
          row.original.birthday
            ? new Date(row.original.birthday).toLocaleDateString('fr-FR')
            : '-',
      },
    ],
    [t]
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card p-4">
      <h2 className="text-lg font-semibold">{t('admin:users.list_title')}</h2>
      <div className="mt-4 min-h-0 flex-1">
        <div className="flex items-center justify-between pb-6">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin:users.search_placeholder')}
              className="bg-background pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={tab === 'users' ? 'default' : 'outline'}
              onClick={() => setTab('users')}
            >
              Utilisateurs actifs
            </Button>
            <Button
              variant={tab === 'invitations' ? 'default' : 'outline'}
              onClick={() => setTab('invitations')}
            >
              Invitations en attente
            </Button>
            <Button onClick={() => setOpen(true)}>
              {t('admin:users.create_button')}
            </Button>
          </div>
        </div>
        {successMessage ? (
          <div className="pb-2 text-sm text-green-600">{successMessage}</div>
        ) : null}
        {tab === 'users' ? (
          isLoading ? (
            <div>{t('loading')}</div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              pagination={{ initialPageSize: 10, pageSizeOptions: [10, 20, 50] }}
            />
          )
        ) : (
          <DataTable
            columns={[
              { accessorKey: 'email', header: 'Email' },
              { accessorKey: 'organizationName', header: 'Club' },
              { accessorKey: 'organizationRole', header: 'Role' },
              { accessorKey: 'inviterName', header: 'Invite par' },
            ]}
            data={invitations}
            pagination={{ initialPageSize: 10, pageSizeOptions: [10, 20, 50] }}
          />
        )}
      </div>

      <CreationDialog
        open={open}
        onOpenChange={setOpen}
        title={t('admin:users.modal.title')}
        description={t('admin:users.modal.description')}
        cancelLabel={t('admin:users.modal.cancel')}
        submitLabel={t('admin:users.modal.submit')}
        submitFormId="create-admin-user-form"
      >
        <CreateAdminInvitationForm
          formId="create-admin-user-form"
          organizations={organizations}
          onSubmit={(input) => {
            createInvitation.mutate(input, {
              onSuccess: () => {
                setOpen(false);
                setSuccessMessage('Invitation envoyee');
              },
            });
          }}
        />
      </CreationDialog>
    </section>
  );
}
