import { Checkbox } from '@/shared/components/ui/checkbox';
import { useTranslation } from '@dropit/i18n';
import { AthleteDto } from '@dropit/schemas';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<AthleteDto>[] = [
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
    accessorKey: 'email',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.email');
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
    accessorKey: 'metrics.weight',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.weight');
    },
    cell: ({ row }) => {
      const weight = row.getValue('metrics.weight');
      return weight ? `${weight} kg` : '-';
    },
  },
  {
    accessorKey: 'competitorStatus.level',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.level');
    },
  },
  {
    accessorKey: 'competitorStatus.sexCategory',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.sex_category');
    },
  },
  {
    accessorKey: 'competitorStatus.weightCategory',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes:columns.weight_category');
    },
    cell: ({ row }) => {
      const weightCategory = row.getValue('competitorStatus.weightCategory');
      return weightCategory ? `${weightCategory} kg` : '-';
    },
  },
];
