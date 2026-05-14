import { ExerciseDetail } from '@/features/exercises/exercise-detail';
import { api } from '@/lib/api';
import { useTranslation } from '@dropit/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { columns } from '@/features/exercises/columns';
import { DataTable } from '@/components/ui/data-table';
import { CreationDialog } from '@/components/shared/creation-dialog';
import { ExerciseCreationForm } from '@/features/exercises/exercise-creation-form';
import { Button } from '@/components/ui/button';
import { DetailsPanel } from '@/components/ui/details-panel';
import { HeroCard } from '@/components/ui/hero-card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { usePageMeta } from '@/hooks/use-page-meta';
import { Library, Search } from 'lucide-react';

export const Route = createFileRoute('/_home/library/exercises')({
  component: ExercisesPage,
});

function ExercisesPage() {
  const { t } = useTranslation();
  const { setPageMeta } = usePageMeta();
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const exerciseCreateFormId = 'exercise-create-form';
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageMeta({ title: t('library.title') });
  }, [setPageMeta, t]);

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { data: exerciseDetails, isLoading: exerciseDetailsLoading } = useQuery(
    {
      queryKey: ['exercise', selectedExercise],
      queryFn: async () => {
        if (!selectedExercise) return null;
        const response = await api.exercise.getExercise({
          params: { id: selectedExercise },
        });
        if (response.status !== 200)
          throw new Error('Failed to load exercise details');
        return response.body;
      },
      enabled: !!selectedExercise,
    }
  );

  const handleCreationSuccess = () => {
    setCreateExerciseModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  };

  const filteredExercises = (exercises ?? []).filter((exercise) =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex gap-6 p-4">
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Fixed header section */}
        <div className="flex-none">
          <HeroCard
            variant="exercise"
            title={t('exercise.hero.title')}
            description={t('exercise.hero.description')}
            stat={{
              label: t('exercise.hero.stat_label'),
              value: exercises?.length || 0,
              icon: Library,
              description: t('exercise.hero.stat_description'),
              callToAction: {
                text: t('exercise.hero.stat_cta'),
                onClick: () => {
                  console.log('Open exercises tutorial video');
                },
              },
            }}
          />
        </div>

        {/* DataTable with internal scroll management */}
        <div className="flex-1 min-h-0">
          {exercisesLoading ? (
            <div className="flex items-center justify-center h-32">
              {t('common.loading')}
            </div>
          ) : !exercises?.length ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
              <p>{t('exercise.filters.no_results')}</p>
              <p className="text-sm">{t('common.start_create')}</p>
              <Button onClick={() => setCreateExerciseModalOpen(true)}>
                {t('exercise.filters.create_exercise')}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-4">
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('exercise.filters.search_placeholder')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="bg-background pl-8"
                  />
                </div>
                <Button onClick={() => setCreateExerciseModalOpen(true)}>
                  {t('exercise.filters.create_exercise')}
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={filteredExercises}
                pagination={
                  filteredExercises.length > 10
                    ? { initialPageSize: 10 }
                    : undefined
                }
                onRowClick={(exerciseId) => setSelectedExercise(exerciseId)}
              />
            </>
          )}
        </div>
      </div>

      <DetailsPanel
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={t('exercise.details.title')}
      >
        {exerciseDetailsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner className="size-8" />
          </div>
        ) : exerciseDetails ? (
          <ExerciseDetail exercise={exerciseDetails} />
        ) : null}
      </DetailsPanel>

      <CreationDialog
        open={createExerciseModalOpen}
        onOpenChange={setCreateExerciseModalOpen}
        title={t('exercise.creation.title')}
        description={t('exercise.creation.description')}
        cancelLabel={t('exercise.creation.cancel')}
        submitLabel={t('exercise.filters.create_exercise')}
        submitFormId={exerciseCreateFormId}
      >
        <ExerciseCreationForm
          formId={exerciseCreateFormId}
          onSuccess={handleCreationSuccess}
        />
      </CreationDialog>
    </div>
  );
}
