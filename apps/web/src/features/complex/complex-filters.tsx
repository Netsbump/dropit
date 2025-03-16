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
import { ComplexCategoryDto } from '@dropit/schemas';
import { useTranslation } from '@dropit/i18n';

interface ComplexFiltersProps {
  onFilterChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreateClick: () => void;
  categories?: ComplexCategoryDto[];
  disabled?: boolean;
}

export function ComplexFilters({
  onFilterChange,
  onCategoryChange,
  onCreateClick,
  categories = [],
  disabled,
}: ComplexFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder={t('complex.filters.search_placeholder')}
          onChange={(e) => onFilterChange(e.target.value)}
          className="max-w-sm"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select onValueChange={onCategoryChange} defaultValue="all">
          <SelectTrigger className="w-fit bg-card font-medium">
            <SelectValue placeholder={t('complex.filters.all_categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('complex.filters.all_categories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={onCreateClick}>{t('complex.filters.create_complex')}</Button>
      </div>
    </div>
  );
}
