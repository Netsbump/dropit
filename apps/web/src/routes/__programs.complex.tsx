import { api } from '@/lib/api'
import { DetailsPanel } from '@/shared/components/ui/details-panel'
import { useTranslation } from '@dropit/i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ComplexCreationForm } from '../features/complex/complex-creation-form'
import { ComplexDetail } from '../features/complex/complex-detail'
import { ComplexFilters } from '../features/complex/complex-filters'
import { ComplexGrid } from '../features/complex/complex-grid'
import { DialogCreation } from '../features/exercises/dialog-creation'

export const Route = createFileRoute('/__programs/complex')({
  component: ComplexPage,
})

function ComplexPage() {
  const { t } = useTranslation();
  const [createComplexModalOpen, setCreateComplexModalOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const queryClient = useQueryClient()
  const [selectedComplex, setSelectedComplex] = useState<string | null>(null)

  const { data: complexes, isLoading } = useQuery({
    queryKey: ['complexes'],
    queryFn: async () => {
      const response = await api.complex.getComplexes()
      if (response.status !== 200) throw new Error('Failed to load complexes')
      return response.body
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['complexCategories'],
    queryFn: async () => {
      const response = await api.complexCategory.getComplexCategories()
      if (response.status !== 200) throw new Error('Failed to load categories')
      return response.body
    },
  })

  const { data: complexDetails } = useQuery({
    queryKey: ['complex', selectedComplex],
    queryFn: async () => {
      if (!selectedComplex) return null
      const response = await api.complex.getComplex({
        params: { id: selectedComplex },
      })
      if (response.status !== 200)
        throw new Error('Failed to load complex details')
      return response.body
    },
    enabled: !!selectedComplex,
  })

  const filteredComplexes = complexes?.filter((complex) => {
    const matchesSearch = complex.name
      .toLowerCase()
      .includes(filter.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || complex.complexCategory?.id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreationSuccess = () => {
    setCreateComplexModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['complexes'] })
  }

  return (
    <div className="relative flex-1">
      <div
        className={`transition-all duration-200 ${
          selectedComplex ? 'mr-[400px]' : ''
        }`}
      >
        <ComplexFilters
          onFilterChange={setFilter}
          onCategoryChange={setCategoryFilter}
          onCreateClick={() => setCreateComplexModalOpen(true)}
          categories={categories}
          disabled={isLoading || !complexes?.length}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            {t('common.loading')}
          </div>
        ) : !complexes?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>{t('complex.filters.no_results')}</p>
            <p className="text-sm">{t('common.start_create')}</p>
          </div>
        ) : (
          <ComplexGrid
            complexes={filteredComplexes || []}
            onComplexClick={(complexId) => setSelectedComplex(complexId)}
          />
        )}
      </div>

      <DetailsPanel
        open={!!selectedComplex}
        onClose={() => setSelectedComplex(null)}
        title={t('complex.details.title')}
      >
        {complexDetails && <ComplexDetail complex={complexDetails} />}
      </DetailsPanel>

      <DialogCreation
        open={createComplexModalOpen}
        onOpenChange={setCreateComplexModalOpen}
        title={t('complex.creation.title')}
        description={t('complex.creation.description')}
      >
        <ComplexCreationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateComplexModalOpen(false)}
        />
      </DialogCreation>
    </div>
  )
}
