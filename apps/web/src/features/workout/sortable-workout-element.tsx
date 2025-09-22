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
import { Textarea } from '@/shared/components/ui/textarea';
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
import { useEffect, useRef, useState } from 'react';
import { Control } from 'react-hook-form';
import { z } from 'zod';

// Définir le schéma étendu pour le formulaire qui inclut le champ session d'entrainement
const extendedWorkoutSchema = createWorkoutSchema.extend({
  trainingSession: z
    .object({
      athleteIds: z.array(z.string()),
      scheduledDate: z.string(),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

interface SortableWorkoutElementProps {
  id: string;
  index: number;
  control: Control<ExtendedWorkoutSchema>;
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
  const [editingElement, setEditingElement] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingExerciseDescription, setEditingExerciseDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState<string>('');
  const [localExerciseDescription, setLocalExerciseDescription] = useState<string>('');
  const selectRef = useRef<HTMLButtonElement>(null);

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
  
  // Trouver l'exercice sélectionné
  const selectedExercise = exercises.find((e) => e.id === control._formValues.elements[index].id);

  // Mettre à jour selectedComplexId et exercice quand l'ID change dans le form
  useEffect(() => {
    const currentId = control._formValues.elements[index].id;
    const currentType = control._formValues.elements[index].type;
    
    if (currentId && currentType === WORKOUT_ELEMENT_TYPES.COMPLEX) {
      setSelectedComplexId(currentId);
      // Initialiser la description locale avec celle du complexe
      const complex = complexes.find(c => c.id === currentId);
      if (complex?.description && !localDescription) {
        setLocalDescription(complex.description);
      }
    }
    
    if (currentId && currentType === WORKOUT_ELEMENT_TYPES.EXERCISE) {
      // Initialiser la description locale avec celle de l'exercice
      const exercise = exercises.find(e => e.id === currentId);
      if (exercise?.description && !localExerciseDescription) {
        setLocalExerciseDescription(exercise.description);
      }
    }
  }, [
    control._formValues.elements[index].id,
    control._formValues.elements[index].type,
    complexes,
    exercises,
    localDescription,
    localExerciseDescription,
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
          name={`elements.${index}.${fieldName}` as const}
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
          name={`elements.${index}.${fieldName}` as const}
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
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingElement(false);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger ref={selectRef}>
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
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {complex.exercises.map(ex => ex.name).join(', ')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {complex.complexCategory?.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingElement(true);
                  // Forcer l'ouverture du Select après un court délai
                  setTimeout(() => {
                    selectRef.current?.click();
                  }, 0);
                }}
                className="font-medium hover:underline text-left w-full"
              >
                {type === WORKOUT_ELEMENT_TYPES.EXERCISE
                  ? exercises.find((e) => e.id === field.value)?.name
                  : complexes.find((c) => c.id === field.value)?.exercises.map(ex => ex.name).join(', ') || 'Complex'}
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
      className={`relative bg-muted/30 ${isDragging ? 'z-50' : ''} ${
        control._formValues.elements[index].type === WORKOUT_ELEMENT_TYPES.COMPLEX
          ? 'min-h-[200px]'
          : 'min-h-[100px]'
      }`}
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
                    control._formValues.elements[index].reps,
                    editingReps,
                    setEditingReps,
                    'reps',
                    1
                  )}
                  {renderElementSelect(WORKOUT_ELEMENT_TYPES.EXERCISE)}
                </div>
                <div className="text-sm text-muted-foreground ml-2">
                  {editingExerciseDescription ? (
                    <Textarea
                      value={localExerciseDescription || selectedExercise?.description || ''}
                      onChange={(e) => setLocalExerciseDescription(e.target.value)}
                      onBlur={() => setEditingExerciseDescription(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingExerciseDescription(false);
                          setLocalExerciseDescription(selectedExercise?.description || '');
                        }
                        if (e.key === 'Enter' && e.ctrlKey) {
                          setEditingExerciseDescription(false);
                        }
                      }}
                      autoFocus
                      className="text-sm resize-none min-h-[60px]"
                      placeholder="Description personnalisée pour cet exercice..."
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted/30 p-2 rounded min-h-[60px] border-2 border-dashed border-transparent hover:border-muted"
                      onClick={() => setEditingExerciseDescription(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setEditingExerciseDescription(true);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Ajouter une description personnalisée pour cet exercice"
                    >
                      {localExerciseDescription || selectedExercise?.description || 'Cliquez pour ajouter une description personnalisée...'}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                  {renderEditableText(
                    control._formValues.elements[index].sets,
                    editingSets,
                    setEditingSets,
                    'sets',
                    'série(s)',
                    1
                  )}
                  <span>à</span>
                  {renderEditableText(
                    control._formValues.elements[index].startWeight_percent,
                    editingWeight,
                    setEditingWeight,
                    'startWeight_percent',
                    '%',
                    0,
                    100
                  )}
                  <span>•</span>
                  {renderEditableText(
                    control._formValues.elements[index].rest || 0,
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
                  {renderElementSelect(WORKOUT_ELEMENT_TYPES.COMPLEX)}
                </div>
                <div className="text-sm text-muted-foreground ml-2">
                    {editingDescription ? (
                      <Textarea
                        value={localDescription || selectedComplex?.description || ''}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={() => setEditingDescription(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingDescription(false);
                            setLocalDescription(selectedComplex?.description || '');
                          }
                          if (e.key === 'Enter' && e.ctrlKey) {
                            setEditingDescription(false);
                          }
                        }}
                        autoFocus
                        className="text-sm resize-none min-h-[60px]"
                        placeholder="Description personnalisée pour ce workout..."
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted/30 p-2 rounded min-h-[60px] border-2 border-dashed border-transparent hover:border-muted"
                        onClick={() => setEditingDescription(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setEditingDescription(true);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Ajouter une description personnalisée pour ce complex"
                      >
                        {localDescription || selectedComplex?.description || 'Cliquez pour ajouter une description personnalisée...'}
                      </div>
                    )}
                </div>
                <div className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                  {renderEditableText(
                    control._formValues.elements[index].sets,
                    editingSets,
                    setEditingSets,
                    'sets',
                    'série(s)',
                    1
                  )}
                  <span>à</span>
                  {renderEditableText(
                    control._formValues.elements[index].startWeight_percent,
                    editingWeight,
                    setEditingWeight,
                    'startWeight_percent',
                    '%',
                    0,
                    100
                  )}
                  <span>•</span>
                  {renderEditableText(
                    control._formValues.elements[index].rest || 0,
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
                        <Badge variant="outline">{exercise.reps}</Badge>
                        <div className="font-medium">{exercise.name}</div>
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
