import { createFileRoute } from '@tanstack/react-router'
import { HeaderPage } from '../shared/components/layout/header-page'
import { useTranslation } from '@dropit/i18n';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const Route = createFileRoute('/athletes')({
  component: AthletesPage,
})

function AthletesPage() {
  const { t } = useTranslation();
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

  const handleCreationSuccess = () => {
    setCreateAthleteModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['exercises'] })
  }

  if (athletesLoading) return <div>{t('common.loading')}</div>
  if (!athletes) return <div>{t('athletes.filters.no_results')}</div>

  return (
    <div className="relative flex-1">
      <HeaderPage title="athletes.title" description="athletes.description" />
      
      <div>Hello "/athletes/"!</div>
    </div>
  );
}
