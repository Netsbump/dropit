import { Button } from '@/shared/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createComplexSchema } from '@dropit/schemas';
import { ExerciseDto } from '@dropit/schemas';
import { GripVertical, Trash2 } from 'lucide-react';
import { Control } from 'react-hook-form';
import { z } from 'zod';

type SortableExerciseItemProps = {
  id: string;
  index: number;
  control: Control<z.infer<typeof createComplexSchema>>;
  onRemove: (index: number) => void;
  onCreateExercise: (index: number) => void;
  exercises?: ExerciseDto[];
  selectedExerciseIds: string[];
};

export function SortableExerciseItem({
  id,
  index,
  control,
  onRemove,
  onCreateExercise,
  exercises,
  selectedExerciseIds,
}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start bg-background rounded-lg border p-3"
    >
      {/* Colonne de gauche avec drag handle et numéro */}
      <div className="flex gap-1.5">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-muted/80 transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground font-medium">
          {index + 1}
        </div>
      </div>

      {/* Colonne principale avec l'exercice et ses paramètres */}
      <div className="flex-1 space-y-3">
        {/* Sélection de l'exercice */}
        <FormField
          control={control}
          name={`exercises.${index}.exerciseId`}
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'new') {
                    onCreateExercise(index);
                  }
                }}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionner un exercice" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exercises?.map((exercise) => (
                    <SelectItem
                      key={exercise.id}
                      value={exercise.id}
                      disabled={
                        selectedExerciseIds.includes(exercise.id) &&
                        field.value !== exercise.id
                      }
                    >
                      {exercise.name}
                      {selectedExerciseIds.includes(exercise.id) &&
                        field.value !== exercise.id &&
                        ' (déjà sélectionné)'}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    + Créer un nouvel exercice
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Paramètres d'entraînement en ligne */}
        <div className="grid grid-cols-4 gap-3">
          {/* Séries */}
          <FormField
            control={control}
            name={`exercises.${index}.trainingParams.sets`}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs text-muted-foreground">
                  Séries
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    min={1}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-8 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Répétitions */}
          <FormField
            control={control}
            name={`exercises.${index}.trainingParams.reps`}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs text-muted-foreground">
                  Répétitions
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    min={1}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-8 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Repos */}
          <FormField
            control={control}
            name={`exercises.${index}.trainingParams.rest`}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs text-muted-foreground whitespace-nowrap">
                  Repos (sec)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    min={0}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-8 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* % Max */}
          <FormField
            control={control}
            name={`exercises.${index}.trainingParams.startWeight_percent`}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs text-muted-foreground whitespace-nowrap">
                  % Max
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    min={0}
                    max={100}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-8 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Bouton de suppression */}
      {index >= 2 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
