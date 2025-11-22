import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ComplexDto } from '@dropit/schemas';
import { MoreHorizontal } from 'lucide-react';
import { getCategoryBadgeVariant } from '@/shared/utils';

interface ComplexCardProps {
  complex: ComplexDto;
  onClick?: () => void;
}


export function ComplexCard({ complex, onClick }: ComplexCardProps) {
  return (
    <Card
      className="cursor-pointer shadow-none hover:shadow-md transition-all hover:border-slate-300 rounded-2xl bg-white"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {complex.exercises?.map(ex => ex.name).join(', ') || 'Aucun exercice'}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex items-center justify-between">
          <Badge 
            className={`text-xs border-0 ${getCategoryBadgeVariant(complex.complexCategory?.name || '')}`}
          >
            {complex.complexCategory?.name || 'Sans catégorie'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {complex.exercises?.length || 0} exercices
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
