import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useTranslation } from '@dropit/i18n';
import { AthleteDetailsDto } from '@dropit/schemas';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<AthleteDetailsDto>[] = [
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
    id: 'name',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('athletes.columns.name');
    },
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      const email = row.original.email;
      const image = row.original.image;

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={image} />
            <AvatarFallback>{`${firstName[0]}${lastName[0]}`}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{`${firstName} ${lastName}`}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'sexCategory',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.sex_category');
    },
    cell: ({ row }) => {
      return row.original.competitorStatus?.sexCategory || '-';
    },
  },
  {
    id: 'weightCategory',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.weight_category');
    },
    cell: ({ row }) => {
      const category = row.original.competitorStatus?.weightCategory;
      return category ? `${category} kg` : '-';
    },
  },
  {
    id: 'weight',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.weight');
    },
    cell: ({ row }) => {
      const metrics = row.original.metrics;
      const weight = metrics?.weight;
      return weight ? `${weight} kg` : '-';
    },
  },
  {
    id: 'snatch',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.snatch');
    },
    cell: ({ row }) => {
      const records = row.original.personalRecords;
      const snatch = records?.snatch;
      return snatch ? `${snatch}kg` : '-';
    },
  },
  {
    id: 'cleanAndJerk',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.clean_and_jerk');
    },
    cell: ({ row }) => {
      const records = row.original.personalRecords;
      const cleanAndJerk = records?.cleanAndJerk;
      return cleanAndJerk ? `${cleanAndJerk}kg` : '-';
    },
  },
  {
    id: 'level',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.level');
    },
    cell: ({ row }) => {
      return row.original.competitorStatus?.level || '-';
    },
  },
  {
    accessorKey: 'birthday',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.birthday');
    },
    cell: ({ row }) => {
      const value = row.original.birthday;
      return value ? new Date(value).getFullYear().toString() : '-';
    },
  },
  {
    accessorKey: 'country',
    header: () => {
      const { t } = useTranslation(['athletes']);
      return t('columns.country');
    },
    cell: ({ row }) => {
      const value = row.getValue('country');
      return value || '-';
    },
  },
];
