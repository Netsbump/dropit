import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@dropit/i18n';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useOrganizationsQuery } from '../hooks/use-organizations-query';
import { useUpdateOrganization } from '../hooks/use-update-organization';

type OrganizationRow = { id: string; name: string };

export function OrganizationsSection() {
  const { t } = useTranslation('common');
  const { data = [], isLoading } = useOrganizationsQuery();
  const updateOrganization = useUpdateOrganization();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [search, setSearch] = useState('');

  const filteredData = data.filter((organization) =>
    organization.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = useMemo<ColumnDef<OrganizationRow>[]>(
    () => [
      { accessorKey: 'name', header: t('admin.organizations.columns.name') },
      { accessorKey: 'id', header: t('admin.organizations.columns.id') },
      {
        id: 'actions',
        header: t('admin.organizations.columns.actions'),
        cell: ({ row }) => {
          const org = row.original;
          const isEditing = editingId === org.id;

          if (isEditing) {
            return (
              <div className="flex items-center gap-2">
                <Input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    updateOrganization.mutate({
                      organizationId: org.id,
                      name: editingName,
                    });
                    setEditingId(null);
                    setEditingName('');
                  }}
                >
                  {t('admin.actions.save')}
                </Button>
              </div>
            );
          }

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingId(org.id);
                setEditingName(org.name);
              }}
            >
              {t('admin.actions.rename')}
            </Button>
          );
        },
      },
    ],
    [editingId, editingName, t, updateOrganization]
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card p-4">
      <h2 className="text-lg font-semibold">
        {t('admin.organizations.list_title')}
      </h2>
      <div className="mt-4 min-h-0 flex-1">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            {t('loading')}
          </div>
        ) : (
          <>
            <div className="relative max-w-lg pb-6">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('admin.organizations.search_placeholder')}
                className="bg-background pl-8"
              />
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
    </section>
  );
}
