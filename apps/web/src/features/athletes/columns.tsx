import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from '@dropit/i18n';
import { Checkbox } from '@/shared/components/ui/checkbox';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  country?: string;
  clubId?: string;
  userId?: string;
}

export const columns: ColumnDef<Athlete>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'firstName',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.first_name');
    },
  },
  {
    accessorKey: 'lastName',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.last_name');
    },
  },
  {
    accessorKey: 'birthday',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.birthday');
    },
    cell: ({ row }) => {
      return new Date(row.getValue('birthday')).toLocaleDateString();
    },
  },
  {
    accessorKey: 'country',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.country');
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.created_at');
    },
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleDateString();
    },
  },
  {
    accessorKey: 'updatedAt',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.updated_at');
    },
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleDateString();
    },
  },
]; 