import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
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
import {
  ComplexDto,
  ExerciseDto,
  WORKOUT_ELEMENT_TYPES,
  createWorkoutSchema,
} from '@dropit/schemas';
import { GripVertical, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { z } from 'zod';

interface SortableWorkoutElementProps {
  id: string;
  index: number;
  control: Control<z.infer<typeof createWorkoutSchema>>;
  onRemove: (index: number) => void;
  exercises?: ExerciseDto[];
  complexes?: ComplexDto[];
}

type TrainingParamField = 'sets' | 'reps' | 'rest' | 'startWeight_percent';

export function SortableWorkoutElement({
  id,
  index,
  control,
  onRemove,
  exercises = [],
  complexes = [],
}: SortableWorkoutElementProps) {
  const [editingSets, setEditingSets] = useState(false);
  const [editingReps, setEditingReps] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingRest, setEditingRest] = useState(false);
  const [editingElement, setEditingElement] = useState(true);

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
  };

  // State pour forcer le re-render
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(
    null
  );

  // Trouver le complex sélectionné
  const selectedComplex = complexes.find((c) => c.id === selectedComplexId);

  // Mettre à jour selectedComplexId quand l'ID change dans le form
  useEffect(() => {
    const currentId = control._formValues.elements[index].id;
    if (
      currentId &&
      control._formValues.elements[index].type === WORKOUT_ELEMENT_TYPES.COMPLEX
    ) {
      setSelectedComplexId(currentId);
    }
  }, [
    control._formValues.elements[index].id,
    control._formValues.elements[index].type,
  ]);

  const renderEditableBadge = (
    value: number,
    isEditing: boolean,
    setIsEditing: (value: boolean) => void,
    fieldName: TrainingParamField,
    min = 0,
    max?: number
  ) => {
    if (isEditing) {
      return (
        <FormField
          control={control}
          name={`elements.${index}.trainingParams.${fieldName}` as const}
          render={({ field }) => (
            <FormItem className="m-0 p-0">
              <FormControl>
                <Input
                  type="number"
                  className="w-16 h-7 px-1 py-0"
                  min={min}
                  max={max}
                  value={field.value || ''}
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? '' : parseInt(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    }

    return (
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-muted"
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsEditing(true);
          }
        }}
      >
        {value}
      </Badge>
    );
  };

  const renderEditableText = (
    value: number,
    isEditing: boolean,
    setIsEditing: (value: boolean) => void,
    fieldName: TrainingParamField,
    suffix: string,
    min = 0,
    max?: number
  ) => {
    if (isEditing) {
      return (
        <FormField
          control={control}
          name={`elements.${index}.trainingParams.${fieldName}` as const}
          render={({ field }) => (
            <FormItem className="m-0 p-0">
              <FormControl>
                <Input
                  type="number"
                  className="w-16 h-6 px-1 py-0"
                  min={min}
                  max={max}
                  value={field.value || ''}
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? '' : parseInt(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    }

    return (
      <button
        type="button"
        className="cursor-pointer hover:underline"
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsEditing(true);
          }
        }}
      >
        {value} {suffix}
      </button>
    );
  };

  const renderElementSelect = (
    type:
      | typeof WORKOUT_ELEMENT_TYPES.EXERCISE
      | typeof WORKOUT_ELEMENT_TYPES.COMPLEX
  ) => {
    return (
      <FormField
        control={control}
        name={`elements.${index}.id`}
        render={({ field }) => (
          <FormItem className="flex-1">
            {editingElement || !field.value ? (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (type === WORKOUT_ELEMENT_TYPES.COMPLEX) {
                    setSelectedComplexId(value);
                  }
                  setEditingElement(false);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Choisir un ${
                        type === WORKOUT_ELEMENT_TYPES.EXERCISE
                          ? 'exercice'
                          : 'complex'
                      }`}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {type === WORKOUT_ELEMENT_TYPES.EXERCISE
                    ? exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))
                    : complexes.map((complex) => (
                        <SelectItem key={complex.id} value={complex.id}>
                          {complex.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                type="button"
                onClick={() => setEditingElement(true)}
                className="font-medium hover:underline text-left w-full"
              >
                {type === WORKOUT_ELEMENT_TYPES.EXERCISE
                  ? exercises.find((e) => e.id === field.value)?.name
                  : complexes.find((c) => c.id === field.value)?.name}
              </button>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <CardContent className="p-4 flex gap-4">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-4">
          {/* Pour les exercices simples */}
          {control._formValues.elements[index].type ===
            WORKOUT_ELEMENT_TYPES.EXERCISE && (
            <div className="flex items-center gap-4 rounded-md p-3">
              <div className="flex-1 ml-2 flex flex-col gap-2">
                <div className="flex flex-1 gap-2">
                  {renderEditableBadge(
                    control._formValues.elements[index].trainingParams.reps,
                    editingReps,
                    setEditingReps,
                    'reps',
                    1
                  )}
                  {renderElementSelect(WORKOUT_ELEMENT_TYPES.EXERCISE)}
                </div>
                <div className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams.sets,
                    editingSets,
                    setEditingSets,
                    'sets',
                    'série(s)',
                    1
                  )}
                  <span>à</span>
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams
                      .startWeight_percent,
                    editingWeight,
                    setEditingWeight,
                    'startWeight_percent',
                    '%',
                    0,
                    100
                  )}
                  <span>•</span>
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams.rest ||
                      0,
                    editingRest,
                    setEditingRest,
                    'rest',
                    's de repos'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pour les complexes */}
          {control._formValues.elements[index].type ===
            WORKOUT_ELEMENT_TYPES.COMPLEX && (
            <div className="flex items-center gap-4 rounded-md p-3">
              <div className="flex-1 ml-2 flex flex-col gap-2">
                <div className="flex flex-1 gap-2">
                  {renderEditableBadge(
                    control._formValues.elements[index].trainingParams.reps,
                    editingReps,
                    setEditingReps,
                    'reps',
                    1
                  )}
                  {renderElementSelect(WORKOUT_ELEMENT_TYPES.COMPLEX)}
                </div>
                <div className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams.sets,
                    editingSets,
                    setEditingSets,
                    'sets',
                    'série(s)',
                    1
                  )}
                  <span>à</span>
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams
                      .startWeight_percent,
                    editingWeight,
                    setEditingWeight,
                    'startWeight_percent',
                    '%',
                    0,
                    100
                  )}
                  <span>•</span>
                  {renderEditableText(
                    control._formValues.elements[index].trainingParams.rest ||
                      0,
                    editingRest,
                    setEditingRest,
                    'rest',
                    's de repos'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Affichage des exercices du complex */}
          {control._formValues.elements[index].type ===
            WORKOUT_ELEMENT_TYPES.COMPLEX &&
            selectedComplex && (
              <div className="ml-6 border-l-2 border-muted pl-4 space-y-2">
                {selectedComplex.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-4 bg-muted/30 rounded-md p-3"
                  >
                    <div className="flex-1 ml-2 flex flex-col gap-2">
                      <div className="flex flex-1 gap-2">
                        <Badge variant="outline">
                          {exercise.trainingParams.reps}
                        </Badge>
                        <div className="font-sm">{exercise.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
