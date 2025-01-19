import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ComplexFiltersProps {
  onFilterChange: (value: string) => void;
  onCreateClick: () => void;
  disabled?: boolean;
}

export function ComplexFilters({
  onFilterChange,
  onCreateClick,
  disabled,
}: ComplexFiltersProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter complexes..."
          onChange={(e) => onFilterChange(e.target.value)}
          className="max-w-sm"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onCreateClick}>Ajouter un complex</Button>
      </div>
    </div>
  );
}
