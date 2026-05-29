import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreationDialog } from '@/components/shared/creation-dialog';
import { DetailsPanel } from '@/components/ui/details-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@dropit/i18n';
import { type ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { CreateOrganizationDialogForm } from './create-organization-dialog-form';
import { useOrganizationsQuery } from '../hooks/use-organizations-query';
import { useUpdateOrganization } from '../hooks/use-update-organization';

type OrganizationRow = { id: string; name: string };

export function OrganizationsSection() {
  const { t } = useTranslation(['admin']);
  const { data = [], isLoading } = useOrganizationsQuery();
  const updateOrganization = useUpdateOrganization();
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const createOrganizationFormId = 'create-organization-form';

  const filteredData = data.filter((organization) =>
    organization.name.toLowerCase().includes(search.toLowerCase())
  );

  const { data: associatedAthletes = [] } = useQuery({
    queryKey: ['admin', 'organization-athletes', selectedOrganization?.id],
    enabled: detailsOpen && Boolean(selectedOrganization?.id),
    queryFn: async () => {
      if (!selectedOrganization) return [];

      const response = await api.athlete.getAthletesByOrganization({
        params: { organizationId: selectedOrganization.id },
      });

      if (response.status !== 200) return [];

      return response.body.map((athlete) => ({
        id: athlete.id,
        name: `${athlete.firstName} ${athlete.lastName}`,
        birthday: athlete.birthday,
      }));
    },
  });

  const columns = useMemo<ColumnDef<OrganizationRow>[]>(
    () => [
      { accessorKey: 'name', header: t('admin:organizations.columns.name') },
      { accessorKey: 'id', header: t('admin:organizations.columns.id') },
      {
        id: 'actions',
        header: t('admin:organizations.columns.actions'),
        cell: ({ row }) => {
          const org = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedOrganization(org);
                    setEditingName(org.name);
                    setDetailsOpen(true);
                  }}
                >
                  {t('admin:actions.view_details')}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  {t('admin:actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card p-4">
        <h2 className="text-lg font-semibold">
          {t('admin:organizations.list_title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('admin:organizations.description')}
        </p>
        <div className="mt-4 min-h-0 flex-1">
          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              {t('loading')}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-6">
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('admin:organizations.search_placeholder')}
                    className="bg-background pl-8"
                  />
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                  {t('admin:organizations.create_button')}
                </Button>
              </div>
              <DataTable
                columns={columns}
                data={filteredData}
                pagination={
                  filteredData.length > 10 ? { initialPageSize: 10 } : undefined
                }
              />
            </>
          )}
        </div>

        <CreationDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title={t('admin:organizations.modal.title')}
          description={t('admin:organizations.modal.description')}
          cancelLabel={t('admin:organizations.modal.cancel')}
          submitLabel={t('admin:organizations.modal.submit')}
          submitFormId={createOrganizationFormId}
        >
          <CreateOrganizationDialogForm
            formId={createOrganizationFormId}
            onSuccess={() => setCreateOpen(false)}
          />
        </CreationDialog>
      </section>

      <DetailsPanel
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={t('admin:organizations.details.title')}
      >
        {selectedOrganization ? (
          <div className="space-y-6 px-1 pb-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('admin:organizations.columns.id')}
              </p>
              <p className="font-mono text-xs">{selectedOrganization.id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('admin:organizations.columns.name')}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    updateOrganization.mutate({
                      organizationId: selectedOrganization.id,
                      name: editingName,
                    });
                    setSelectedOrganization({ ...selectedOrganization, name: editingName });
                  }}
                >
                  {t('admin:actions.save')}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t('admin:organizations.details.athletes_title')}
              </h3>
              {associatedAthletes.length ? (
                <div className="space-y-2">
                  {associatedAthletes.map((athlete) => (
                    <div key={athlete.id} className="rounded-md border p-2 text-sm">
                      <p className="font-mono text-xs text-muted-foreground">
                        {athlete.id}
                      </p>
                      <p>{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {athlete.birthday
                          ? new Date(athlete.birthday).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('admin:organizations.details.no_athletes')}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DetailsPanel>
    </div>
  );
}
