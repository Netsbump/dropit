import { ExerciseDetail } from '@/features/exercises/exercise-detail'
import { api } from '@/lib/api'
import { useTranslation } from '@dropit/i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { columns } from '../features/exercises/columns'
import { DataTable } from '../features/exercises/data-table'
import { DialogCreation } from '../features/exercises/dialog-creation'
import { ExerciseCreationForm } from '../features/exercises/exercise-creation-form'
import { Button } from '../shared/components/ui/button'
import { DetailsPanel } from '../shared/components/ui/details-panel'

export const Route = createFileRoute('/__home/programs/exercises')({
  component: ExercisesPage,
})

function ExercisesPage() {
  const { t } = useTranslation();
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises()
      if (response.status !== 200) throw new Error('Failed to load exercises')
      return response.body
    },
  })

  const { data: exerciseDetails } = useQuery({
    queryKey: ['exercise', selectedExercise],
    queryFn: async () => {
      if (!selectedExercise) return null
      const response = await api.exercise.getExercise({
        params: { id: selectedExercise },
      })
      if (response.status !== 200)
        throw new Error('Failed to load exercise details')
      return response.body
    },
    enabled: !!selectedExercise,
  })

  const handleCreationSuccess = () => {
    setCreateExerciseModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['exercises'] })
  }

  if (exercisesLoading) return <div>{t('common.loading')}</div>
  if (!exercises) return <div>{t('exercise.filters.no_results')}</div>

  return (
    <div className="relative flex-1">
      <div
        className={`transition-all duration-200 ${
          selectedExercise ? 'lg:mr-[430px]' : ''
        }`}
      >
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
          <DataTable
            columns={columns}
            data={exercises}
            onDialogCreation={setCreateExerciseModalOpen}
            onRowClick={(exerciseId) => setSelectedExercise(exerciseId)}
          />
        )}
      </div>

      <DetailsPanel
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={t('exercise.details.title')}
      >
        {exerciseDetails && <ExerciseDetail exercise={exerciseDetails} />}
      </DetailsPanel>

      <DialogCreation
        open={createExerciseModalOpen}
        onOpenChange={setCreateExerciseModalOpen}
        title={t('exercise.creation.title')}
        description={t('exercise.creation.description')}
      >
        <ExerciseCreationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateExerciseModalOpen(false)}
        />
      </DialogCreation>
    </div>
  )
}
