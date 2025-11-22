import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
  createWorkoutSchema,
  BlockConfigDto,
} from '@dropit/schemas';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import { Control, useFormContext } from 'react-hook-form';
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

export function SortableWorkoutElement({
  id,
  index,
  control,
  onRemove,
  exercises = [],
  complexes = [],
}: SortableWorkoutElementProps) {
  const { setValue, watch } = useFormContext<ExtendedWorkoutSchema>();
  const element = watch(`elements.${index}`);

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

  // Récupérer l'exercice ou le complex associé
  const selectedExercise = element?.type === 'exercise'
    ? exercises.find((e) => e.id === element.exerciseId)
    : undefined;

  const selectedComplex = element?.type === 'complex'
    ? complexes.find((c) => c.id === element.complexId)
    : undefined;

  // Fonction pour ajouter un block (copie du dernier)
  const handleAddBlock = () => {
    if (!element?.blocks) return;

    const lastBlock = element.blocks[element.blocks.length - 1];
    const newBlock: BlockConfigDto = {
      ...lastBlock,
      order: element.blocks.length + 1,
    };

    setValue(`elements.${index}.blocks`, [...element.blocks, newBlock]);
  };

  // Fonction pour supprimer un block
  const handleRemoveBlock = (blockIndex: number) => {
    if (!element?.blocks || element.blocks.length <= 1) return;

    const newBlocks = element.blocks.filter((_, idx) => idx !== blockIndex);
    // Réorganiser les order
    const reorderedBlocks = newBlocks.map((block, idx) => ({
      ...block,
      order: idx + 1,
    }));

    setValue(`elements.${index}.blocks`, reorderedBlocks);
  };

  // Rendu d'un block pour un exercice simple
  const renderExerciseBlock = (blockIndex: number, block: BlockConfigDto) => {
    return (
      <div key={blockIndex} className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Block {block.order}:</span>

        {/* Nombre de séries */}
        <FormField
          control={control}
          name={`elements.${index}.blocks.${blockIndex}.numberOfSets`}
          render={({ field }) => (
            <FormItem className="m-0">
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="w-16 h-8 px-2"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">série(s) ×</span>

        {/* Reps */}
        <FormField
          control={control}
          name={`elements.${index}.blocks.${blockIndex}.exercises.0.reps`}
          render={({ field }) => (
            <FormItem className="m-0">
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="w-16 h-8 px-2"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">rep(s) @</span>

        {/* Intensité */}
        <FormField
          control={control}
          name={`elements.${index}.blocks.${blockIndex}.intensity.percentageOfMax`}
          render={({ field }) => (
            <FormItem className="m-0">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  className="w-16 h-8 px-2"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Type d'intensité */}
        <FormField
          control={control}
          name={`elements.${index}.blocks.${blockIndex}.intensity.type`}
          render={({ field }) => (
            <FormItem className="m-0">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="rpe">RPE</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Repos */}
        <span className="text-muted-foreground">-</span>
        <FormField
          control={control}
          name={`elements.${index}.blocks.${blockIndex}.rest`}
          render={({ field }) => (
            <FormItem className="m-0">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  className="w-16 h-8 px-2"
                  placeholder="0"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">s</span>

        {/* Bouton supprimer block */}
        {element?.blocks && element.blocks.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleRemoveBlock(blockIndex)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Rendu d'un block pour un complex
  const renderComplexBlock = (blockIndex: number, block: BlockConfigDto) => {
    return (
      <div key={blockIndex} className="flex flex-col gap-2 text-sm border rounded-md p-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="font-medium">Block {block.order}:</span>

          {/* Nombre de séries */}
          <FormField
            control={control}
            name={`elements.${index}.blocks.${blockIndex}.numberOfSets`}
            render={({ field }) => (
              <FormItem className="m-0">
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className="w-16 h-8 px-2"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <span className="text-muted-foreground">série(s) ×</span>

          {/* Reps pour chaque exercice du complex */}
          {block.exercises.map((exConfig, exIdx) => {
            const exercise = exercises.find(e => e.id === exConfig.exerciseId);
            return (
              <div key={`${block.order}-${exConfig.exerciseId}-${exConfig.order}`} className="flex items-center gap-1">
                {exIdx > 0 && <span className="text-muted-foreground">+</span>}
                <FormField
                  control={control}
                  name={`elements.${index}.blocks.${blockIndex}.exercises.${exIdx}.reps`}
                  render={({ field }) => (
                    <FormItem className="m-0">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="w-16 h-8 px-2"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          title={exercise?.name}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
          <span className="text-muted-foreground">rep(s) @</span>

          {/* Intensité */}
          <FormField
            control={control}
            name={`elements.${index}.blocks.${blockIndex}.intensity.percentageOfMax`}
            render={({ field }) => (
              <FormItem className="m-0">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    className="w-16 h-8 px-2"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Type d'intensité */}
          <FormField
            control={control}
            name={`elements.${index}.blocks.${blockIndex}.intensity.type`}
            render={({ field }) => (
              <FormItem className="m-0">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="rpe">RPE</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Repos */}
          <span className="text-muted-foreground">-</span>
          <FormField
            control={control}
            name={`elements.${index}.blocks.${blockIndex}.rest`}
            render={({ field }) => (
              <FormItem className="m-0">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 h-8 px-2"
                    placeholder="0"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <span className="text-muted-foreground">s</span>

          {/* Bouton supprimer block */}
          {element?.blocks && element.blocks.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive ml-auto"
              onClick={() => handleRemoveBlock(blockIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Légende des exercices */}
        <div className="text-xs text-muted-foreground ml-4">
          {block.exercises.map((exConfig, exIdx) => {
            const exercise = exercises.find(e => e.id === exConfig.exerciseId);
            return (
              <span key={`${block.order}-${exConfig.exerciseId}-${exConfig.order}`}>
                {exercise?.shortName || exercise?.name}
                {exIdx < block.exercises.length - 1 ? ' + ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative bg-muted/30 ${isDragging ? 'z-50' : ''}`}
    >
      <CardContent className="p-4 flex gap-4">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-3">
          {/* En-tête : nom de l'exercice/complex */}
          <div className="flex items-center gap-2">
            {element?.type === 'exercise' ? (
              <>
                <Badge variant="secondary">EXERCISE</Badge>
                <span className="font-medium">{selectedExercise?.name || 'Exercice non trouvé'}</span>
              </>
            ) : (
              <>
                <Badge variant="secondary">COMPLEX</Badge>
                <span className="font-medium">
                  {selectedComplex?.exercises.map(ex => ex.shortName || ex.name).join(' + ') || 'Complex non trouvé'}
                </span>
              </>
            )}
          </div>

          {/* Blocks */}
          <div className="space-y-2 ml-4">
            {element?.blocks?.map((block, blockIndex) => (
              element.type === 'exercise'
                ? renderExerciseBlock(blockIndex, block)
                : renderComplexBlock(blockIndex, block)
            ))}

            {/* Bouton ajouter un block */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBlock}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un block
            </Button>
          </div>

          {/* Configuration finale : commentary, tempo, référence */}
          <div className="space-y-2 ml-4 pt-2 border-t">
            {/* Commentaire */}
            <FormField
              control={control}
              name={`elements.${index}.commentary`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Commentaire (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Commentaire du coach..."
                      className="min-h-[60px] text-sm"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Tempo */}
              <FormField
                control={control}
                name={`elements.${index}.tempo`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Tempo (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: 3010"
                        className="h-8 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Référence max (pour complex uniquement) */}
              {element?.type === 'complex' && selectedComplex && (
                <FormField
                  control={control}
                  name={`elements.${index}.blocks.0.intensity.referenceExerciseId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Référence max</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedComplex.exercises.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                              {ex.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
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
