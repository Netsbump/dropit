import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { WorkoutCategoryDto } from '@dropit/schemas';
import { useTranslation } from '@dropit/i18n';
import { Search } from 'lucide-react';

interface WorkoutFiltersProps {
  onFilterChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreateClick: () => void;
  categories?: WorkoutCategoryDto[];
  disabled?: boolean;
}

export function WorkoutFilters({
  onFilterChange,
  onCategoryChange,
  onCreateClick,
  categories = [],
  disabled,
}: WorkoutFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center w-full justify-between pb-6">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('workout.filters.search_placeholder')}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-8 bg-sidebar max-w-lg"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={onCategoryChange} defaultValue="all">
            <SelectTrigger className="w-fit bg-card font-medium">
              <SelectValue placeholder={t('workout.filters.all_categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('workout.filters.all_categories')}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Button onClick={onCreateClick} disabled={disabled}>
            {t('workout.filters.create_workout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
