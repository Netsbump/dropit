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
  return (
    <div className="flex justify-between items-center py-4">
      <Input
        placeholder="Rechercher un entraînement..."
        onChange={(e) => onFilterChange(e.target.value)}
        className="max-w-xs"
        disabled={disabled}
      />
      <div className="flex items-center gap-2">
        <Select onValueChange={onCategoryChange} defaultValue="all">
          <SelectTrigger className="w-fit bg-card font-medium">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={onCreateClick} disabled={disabled}>
          Créer un entraînement
        </Button>
      </div>
    </div>
  );
}
