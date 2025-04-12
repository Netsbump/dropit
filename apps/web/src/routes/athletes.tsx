import { createFileRoute } from '@tanstack/react-router'
import { HeaderPage } from '../shared/components/layout/header-page'
import { useTranslation } from '@dropit/i18n';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { columns } from '../features/athletes/columns';
import { DataTable } from '../features/athletes/data-table';
import { DialogCreation } from '../features/athletes/dialog-creation';
import { AthleteCreationForm } from '../features/athletes/athlete-creation-form';
import { Button } from '../shared/components/ui/button';
import { DetailsPanel } from '../shared/components/ui/details-panel';

export const Route = createFileRoute('/athletes')({
  component: AthletesPage,
})

function AthletesPage() {
  const { t } = useTranslation(['common', 'athletes']);
  const [createAthleteModalOpen, setCreateAthleteModalOpen] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: athletes, isLoading: athletesLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const response = await api.athlete.getAthletes()
      if (response.status !== 200) throw new Error('Failed to load athletes')
      return response.body
    },
  })

  const { data: athleteDetails } = useQuery({
    queryKey: ['athlete', selectedAthlete],
    queryFn: async () => {
      if (!selectedAthlete) return null;
      const response = await api.athlete.getAthlete({
        params: { id: selectedAthlete },
      });
      if (response.status !== 200)
        throw new Error('Failed to load athlete details');
      return response.body;
    },
    enabled: !!selectedAthlete,
  });

  const handleCreationSuccess = () => {
    setCreateAthleteModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['athletes'] })
  }

  if (athletesLoading) return <div>{t('common:loading')}</div>
  if (!athletes) return <div>{t('common:no_results')}</div>

  return (
    <div className="relative flex-1">
      <HeaderPage title="athletes:title" description="athletes:description" />
      
      <div
        className={`transition-all duration-200 ${
          selectedAthlete ? 'mr-[400px]' : ''
        }`}
      >
        {athletesLoading ? (
          <div className="flex items-center justify-center h-32">
            {t('common:loading')}
          </div>
        ) : !athletes?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>{t('common:no_results')}</p>
            <p className="text-sm">{t('common:start_create')}</p>
            <Button onClick={() => setCreateAthleteModalOpen(true)}>
              {t('athletes:filters.create_athlete')}
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={athletes}
            onDialogCreation={setCreateAthleteModalOpen}
            onRowClick={(athleteId) => setSelectedAthlete(athleteId)}
          />
        )}
      </div>

      <DetailsPanel
        open={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        title={t('athletes:details.title')}
      >
        {athleteDetails && (
          <div className="p-4">
            {/* TODO: Implement athlete details view */}
            <pre>{JSON.stringify(athleteDetails, null, 2)}</pre>
          </div>
        )}
      </DetailsPanel>

      <DialogCreation
        open={createAthleteModalOpen}
        onOpenChange={setCreateAthleteModalOpen}
        title={t('athletes:creation.title')}
        description={t('athletes:creation.description')}
      >
        <AthleteCreationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateAthleteModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
