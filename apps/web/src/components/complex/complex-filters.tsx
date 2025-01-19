import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ComplexCategoryDto } from '@dropit/schemas';

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
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter complexes..."
          onChange={(e) => onFilterChange(e.target.value)}
          className="max-w-sm"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select onValueChange={onCategoryChange} defaultValue="all">
          <SelectTrigger className="w-fit bg-card font-medium">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={onCreateClick}>Ajouter un complex</Button>
      </div>
    </div>
  );
}
