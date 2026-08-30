import { CreationDialog } from '@/components/shared/creation-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DetailsPanel } from '@/components/ui/details-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ServerPagination } from '@/components/ui/server-pagination';
import { useOffsetPagination } from '@/hooks/use-offset-pagination';
import { useTranslation } from '@dropit/i18n';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ORGANIZATION_ATHLETES_PAGE_SIZE,
  useOrganizationAthletesQuery,
} from '../hooks/use-organization-athletes-query';
import { useOrganizationsQuery } from '../hooks/use-organizations-query';
import { useUpdateOrganization } from '../hooks/use-update-organization';
import { CreateOrganizationDialogForm } from './create-organization-dialog-form';

type OrganizationRow = { id: string; name: string };

export function OrganizationsSection() {
  const { t } = useTranslation(['admin', 'common']);
  const { data = [], isLoading } = useOrganizationsQuery();
  const updateOrganization = useUpdateOrganization();
  const [detailPanel, setDetailPanel] = useState<{
    organization: OrganizationRow | null;
    open: boolean;
    editingName: string;
  }>({
    organization: null,
    open: false,
    editingName: '',
  });
  const [search, setSearch] = useState('');
  const organizationAthletesPagination = useOffsetPagination(
    ORGANIZATION_ATHLETES_PAGE_SIZE
  );
  const [createOpen, setCreateOpen] = useState(false);
  const createOrganizationFormId = 'create-organization-form';

  const filteredData = data.filter((organization) =>
    organization.name.toLowerCase().includes(search.toLowerCase())
  );
  const hasScrollableTable = filteredData.length > 10;

  const { data: associatedAthletesPage } = useOrganizationAthletesQuery({
    organizationId: detailPanel.organization?.id,
    offset: organizationAthletesPagination.offset,
    enabled: detailPanel.open,
  });

  const associatedAthletes = associatedAthletesPage?.data ?? [];
  const associatedAthletesPagination = associatedAthletesPage?.pagination ?? {
    limit: ORGANIZATION_ATHLETES_PAGE_SIZE,
    offset: organizationAthletesPagination.offset,
    total: 0,
    hasNext: false,
  };

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
                    organizationAthletesPagination.reset();
                    setDetailPanel({
                      organization: org,
                      editingName: org.name,
                      open: true,
                    });
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
    [t, organizationAthletesPagination.reset]
  );

  return (
    <div
      className={
        hasScrollableTable
          ? 'flex min-h-0 flex-1 gap-4 overflow-hidden'
          : 'flex min-h-0 flex-1 items-start gap-4 overflow-hidden'
      }
    >
      <section
        className={
          hasScrollableTable
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card p-4'
            : 'flex max-h-full w-full flex-col overflow-hidden rounded-2xl border bg-card p-4'
        }
      >
        <h2 className="text-lg font-semibold">
          {t('admin:organizations.list_title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('admin:organizations.description')}
        </p>
        <div
          className={
            hasScrollableTable
              ? 'mt-4 flex min-h-0 flex-1 flex-col gap-4'
              : 'mt-4 flex min-h-0 flex-col gap-4'
          }
        >
          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              {t('loading')}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('admin:organizations.search_placeholder')}
                    className="bg-background pl-8"
                  />
                </div>
                <Button
                  className="shrink-0 sm:w-auto"
                  onClick={() => setCreateOpen(true)}
                >
                  {t('admin:organizations.create_button')}
                </Button>
              </div>
              <div
                className={hasScrollableTable ? 'min-h-0 flex-1' : 'min-h-0'}
              >
                <DataTable
                  columns={columns}
                  data={filteredData}
                  fillHeight={hasScrollableTable}
                  pagination={
                    filteredData.length > 10
                      ? { initialPageSize: 10 }
                      : undefined
                  }
                />
              </div>
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
        open={detailPanel.open}
        onClose={() => {
          organizationAthletesPagination.reset();
          setDetailPanel((prev) => ({ ...prev, open: false }));
        }}
        title={t('admin:organizations.details.title')}
      >
        {detailPanel.organization ? (
          <div className="space-y-6 px-1 pb-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('admin:organizations.columns.id')}
              </p>
              <p className="font-mono text-xs">{detailPanel.organization.id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('admin:organizations.columns.name')}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={detailPanel.editingName}
                  onChange={(event) =>
                    setDetailPanel((prev) => ({
                      ...prev,
                      editingName: event.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!detailPanel.organization) return;
                    const { organization, editingName } = detailPanel;
                    updateOrganization.mutate({
                      organizationId: organization.id,
                      name: editingName,
                    });
                    setDetailPanel((prev) => ({
                      ...prev,
                      organization: {
                        ...organization,
                        name: editingName,
                      },
                    }));
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
                <div className="space-y-3">
                  <div className="space-y-2">
                    {associatedAthletes.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="rounded-md border p-2 text-sm"
                      >
                        <p className="font-mono text-xs text-muted-foreground">
                          {athlete.id}
                        </p>
                        <p>{athlete.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {athlete.birthday
                            ? new Date(athlete.birthday).toLocaleDateString(
                                'fr-FR'
                              )
                            : '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                  <ServerPagination
                    pagination={associatedAthletesPagination}
                    itemCount={associatedAthletes.length}
                    onPreviousPage={organizationAthletesPagination.previousPage}
                    onNextPage={organizationAthletesPagination.nextPage}
                  />
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
