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
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useTranslation } from '@dropit/i18n';

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
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<ExtendedWorkoutSchema>();
  const element = watch(`elements.${index}`);
  const [showCommentary, setShowCommentary] = useState(!!element?.commentary);
  const [showTempo, setShowTempo] = useState(!!element?.tempo);
  const [showRest, setShowRest] = useState<Record<number, boolean>>(() => {
    // Initialiser l'état pour chaque block qui a déjà un rest
    const initialState: Record<number, boolean> = {};
    element?.blocks?.forEach((block, idx) => {
      if (block.rest !== undefined && block.rest !== null) {
        initialState[idx] = true;
      }
    });
    return initialState;
  });

  // Synchroniser l'état avec les valeurs du formulaire
  useEffect(() => {
    if (element?.commentary) {
      setShowCommentary(true);
    }
    if (element?.tempo) {
      setShowTempo(true);
    }
    // Synchroniser showRest avec les valeurs existantes
    const newShowRest: Record<number, boolean> = {};
    element?.blocks?.forEach((block, idx) => {
      if (block.rest !== undefined && block.rest !== null) {
        newShowRest[idx] = true;
      }
    });
    setShowRest(newShowRest);
  }, [element?.commentary, element?.tempo, element?.blocks]);

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

  // Fonction pour toggle l'affichage du rest
  const toggleRest = (blockIndex: number) => {
    setShowRest(prev => ({
      ...prev,
      [blockIndex]: !prev[blockIndex]
    }));
    // Si on masque, réinitialiser la valeur
    if (showRest[blockIndex]) {
      setValue(`elements.${index}.blocks.${blockIndex}.rest`, undefined);
    }
  };

  // Rendu d'un block pour un exercice simple
  const renderExerciseBlock = (blockIndex: number, block: BlockConfigDto) => {
    return (
      <div key={blockIndex} className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t('workout.block')} {block.order}:</span>

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
                  className="w-16 h-8 px-2 bg-white"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">{t('workout.series')} {t('workout.sets_of')}</span>

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
                  className="w-16 h-8 px-2 bg-white"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">{t('workout.reps')} @</span>

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
                  className="w-16 h-8 px-2 bg-white"
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
                  <SelectTrigger className="w-20 h-8 bg-white">
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

        {/* Bouton pour ajouter repos */}
        {!showRest[blockIndex] && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleRest(blockIndex)}
            className="h-8 text-xs rounded-full"
          >
            {t('workout.add_rest')}
          </Button>
        )}

        {/* Repos */}
        {showRest[blockIndex] && (
          <>
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
                      className="w-16 h-8 px-2 bg-white"
                      placeholder="0"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-muted-foreground">{t('workout.seconds')}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleRest(blockIndex)}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}

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
      <div key={blockIndex} className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t('workout.block')} {block.order}:</span>

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
                  className="w-16 h-8 px-2 bg-white"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-muted-foreground">{t('workout.series')} {t('workout.sets_of')}</span>

        {/* Reps pour chaque exercice du complex */}
        {block.exercises.map((exConfig, exIdx) => {
          const exercise = exercises.find(e => e.id === exConfig.exerciseId);
          return (
            <div key={`${block.order}-${exConfig.exerciseId}-${exConfig.order}`} className="flex items-center gap-1">
              {exIdx > 0 && <Plus className="h-4 w-4 text-muted-foreground" />}
              <FormField
                control={control}
                name={`elements.${index}.blocks.${blockIndex}.exercises.${exIdx}.reps`}
                render={({ field }) => (
                  <FormItem className="m-0">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="w-16 h-8 px-2 bg-white"
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
        <span className="text-muted-foreground">{t('workout.reps')} @</span>

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
                  className="w-16 h-8 px-2 bg-white"
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
                  <SelectTrigger className="w-20 h-8 bg-white">
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

        {/* Bouton pour ajouter repos */}
        {!showRest[blockIndex] && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleRest(blockIndex)}
            className="h-8 text-xs rounded-full"
          >
            {t('workout.add_rest')}
          </Button>
        )}

        {/* Repos */}
        {showRest[blockIndex] && (
          <>
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
                      className="w-16 h-8 px-2 bg-white"
                      placeholder="0"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-muted-foreground">{t('workout.seconds')}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleRest(blockIndex)}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}

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

  const isExercise = element?.type === 'exercise';
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative shadow-none ${
        isExercise
          ? 'bg-tertiary/30 border-tertiary'
          : 'bg-secondary/30 border-secondary'
      } ${isDragging ? 'z-50' : ''}`}
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
                <Badge
                  variant="secondary"
                  className="bg-muted text-tertiary-foreground hover:bg-muted"
                >
                  {t('workout.exercise_label')}
                </Badge>
                <span className="font-medium">{selectedExercise?.name || t('workout.exercise_not_found')}</span>
              </>
            ) : (
              <>
                <Badge
                  variant="secondary"
                  className="bg-muted text-secondary-foreground hover:bg-muted"
                >
                  {t('workout.complex_label')}
                </Badge>
                <span className="font-medium">
                  {selectedComplex?.exercises.map(ex => ex.name).join(' + ') || t('workout.complex_not_found')}
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
              className="mt-2 rounded-full"
            >
              {t('workout.add_block')}
            </Button>
          </div>

          {/* Configuration finale : commentary, tempo, référence */}
          <div className="space-y-2 ml-4 pt-2 border-t">
            {/* Boutons pour ajouter commentaire et tempo */}
            <div className="flex gap-2">
              {!showCommentary && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentary(true)}
                  className="h-8 text-xs rounded-full"
                >
                  {t('workout.add_commentary')}
                </Button>
              )}
              {!showTempo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTempo(true)}
                  className="h-8 text-xs rounded-full"
                >
                  {t('workout.add_tempo')}
                </Button>
              )}
            </div>

            {/* Commentaire */}
            {showCommentary && (
              <FormField
                control={control}
                name={`elements.${index}.commentary`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs text-muted-foreground">{t('workout.commentary_optional')}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCommentary(false);
                          setValue(`elements.${index}.commentary`, undefined);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder={t('workout.commentary_placeholder')}
                        className="min-h-[60px] text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {(showTempo || (element?.type === 'complex' && selectedComplex)) && (
              <div className={`grid gap-4 ${showTempo && element?.type === 'complex' && selectedComplex ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Tempo */}
                {showTempo && (
                  <FormField
                    control={control}
                    name={`elements.${index}.tempo`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs text-muted-foreground">{t('workout.tempo_optional')}</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowTempo(false);
                              setValue(`elements.${index}.tempo`, undefined);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            placeholder={t('workout.tempo_placeholder')}
                            className="h-8 text-sm bg-white"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Référence max (pour complex uniquement) */}
                {element?.type === 'complex' && selectedComplex && (
                  <FormField
                    control={control}
                    name={`elements.${index}.blocks.0.intensity.referenceExerciseId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">{t('workout.max_reference')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm bg-white">
                              <SelectValue placeholder={t('workout.select_placeholder')} />
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
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="text-destructive rounded-full"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
