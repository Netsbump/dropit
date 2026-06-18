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
  const [invitationSearch, setInvitationSearch] = useState('');
  const [open, setOpen] = useState(false);
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

  const filteredInvitations = invitations.filter((invitation) => {
    const full =
      `${invitation.email} ${invitation.organizationName} ${invitation.organizationRole} ${invitation.inviterName}`.toLowerCase();
    return full.includes(invitationSearch.toLowerCase());
  });
  const hasScrollableUsersTable = filtered.length > 10;
  const hasScrollableInvitationsTable = filteredInvitations.length > 10;
  const hasScrollableTable =
    hasScrollableUsersTable || hasScrollableInvitationsTable;

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
    <div
      className={
        hasScrollableTable
          ? 'flex min-h-0 flex-1 flex-col gap-6 overflow-hidden'
          : 'flex min-h-0 flex-1 flex-col items-start gap-6 overflow-hidden'
      }
    >
      <section
        className={
          hasScrollableUsersTable
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card p-4'
            : 'flex max-h-full w-full flex-col overflow-hidden rounded-2xl border bg-card p-4'
        }
      >
        <h2 className="text-lg font-semibold">Utilisateurs actifs</h2>

        <div
          className={
            hasScrollableUsersTable
              ? 'mt-4 flex min-h-0 flex-1 flex-col gap-4'
              : 'mt-4 flex min-h-0 flex-col gap-4'
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('admin:users.search_placeholder')}
                className="bg-background pl-8"
              />
            </div>
            <Button
              className="shrink-0 sm:w-auto"
              onClick={() => setOpen(true)}
            >
              {t('admin:users.create_button')}
            </Button>
          </div>
          {successMessage ? (
            <div className="text-sm text-green-600">{successMessage}</div>
          ) : null}
          {isLoading ? (
            <div>{t('loading')}</div>
          ) : (
            <div
              className={hasScrollableUsersTable ? 'min-h-0 flex-1' : 'min-h-0'}
            >
              <DataTable
                columns={columns}
                data={filtered}
                fillHeight={hasScrollableUsersTable}
                pagination={
                  hasScrollableUsersTable
                    ? {
                        initialPageSize: 10,
                        pageSizeOptions: [10, 20, 50],
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </section>

      <section
        className={
          hasScrollableInvitationsTable
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card p-4'
            : 'flex max-h-full w-full flex-col overflow-hidden rounded-2xl border bg-card p-4'
        }
      >
        <h2 className="text-lg font-semibold">Invitations en attente</h2>

        <div
          className={
            hasScrollableInvitationsTable
              ? 'mt-4 flex min-h-0 flex-1 flex-col gap-4'
              : 'mt-4 flex min-h-0 flex-col gap-4'
          }
        >
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={invitationSearch}
              onChange={(event) => setInvitationSearch(event.target.value)}
              placeholder="Rechercher des invitations"
              className="bg-background pl-8"
            />
          </div>
          <div
            className={
              hasScrollableInvitationsTable ? 'min-h-0 flex-1' : 'min-h-0'
            }
          >
            <DataTable
              columns={[
                { accessorKey: 'email', header: 'Email' },
                { accessorKey: 'organizationName', header: 'Club' },
                { accessorKey: 'organizationRole', header: 'Role' },
                { accessorKey: 'inviterName', header: 'Invite par' },
              ]}
              data={filteredInvitations}
              fillHeight={hasScrollableInvitationsTable}
              pagination={
                hasScrollableInvitationsTable
                  ? { initialPageSize: 10, pageSizeOptions: [10, 20, 50] }
                  : undefined
              }
            />
          </div>
        </div>
      </section>

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
    </div>
  );
}
