import { ComplexDto } from '@dropit/schemas';
import { ComplexCard } from './complex-card';

interface ComplexGridProps {
  complexes: ComplexDto[];
}

export function ComplexGrid({ complexes }: ComplexGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {complexes.map((complex) => (
        <ComplexCard key={complex.id} complex={complex} />
      ))}
    </div>
  );
}
