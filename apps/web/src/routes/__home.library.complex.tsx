import { api } from '@/lib/api'
import { DetailsPanel } from '@/shared/components/ui/details-panel'
import { HeroCard } from '@/shared/components/ui/hero-card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Spinner } from '@/shared/components/ui/spinner'
import { useTranslation } from '@dropit/i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ComplexCreationForm } from '../features/complex/complex-creation-form'
import { ComplexDetail } from '../features/complex/complex-detail'
import { ComplexFilters } from '../features/complex/complex-filters'
import { ComplexGrid } from '../features/complex/complex-grid'
import { DialogCreation } from '../features/exercises/dialog-creation'
import { usePageMeta } from '../shared/hooks/use-page-meta'
import { Button } from '@/shared/components/ui/button'
import { Zap } from 'lucide-react'

export const Route = createFileRoute('/__home/library/complex')({
  component: ComplexPage,
})

function ComplexPage() {
  const { t } = useTranslation();
  const { setPageMeta } = usePageMeta();
  const [createComplexModalOpen, setCreateComplexModalOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const queryClient = useQueryClient()
  const [selectedComplex, setSelectedComplex] = useState<string | null>(null)

  useEffect(() => {
    setPageMeta({ title: t('library.title') });
  }, [setPageMeta, t]);

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

  const { data: complexDetails, isLoading: complexDetailsLoading } = useQuery({
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
    const matchesSearch = complex.complexCategory?.name
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
    <div className="h-full flex gap-6">
      <div className="flex-1 min-w-0 flex flex-col p-8">
        {/* Fixed header section */}
        <div className="flex-none space-y-6 mb-6">
          <HeroCard
            variant="complex"
            title={t('complex.hero.title')}
            description={t('complex.hero.description')}
            stat={{
              label: t('complex.hero.stat_label'),
              value: complexes?.length || 0,
              icon: Zap,
              description: t('complex.hero.stat_description'),
              callToAction: {
                text: t('complex.hero.stat_cta'),
                onClick: () => {
                  console.log('Open complex tutorial video');
                }
              }
            }}
          />

          <ComplexFilters
            onFilterChange={setFilter}
            onCategoryChange={setCategoryFilter}
            onCreateClick={() => setCreateComplexModalOpen(true)}
            categories={categories}
            disabled={isLoading || !complexes?.length}
          />
        </div>

        {/* Scrollable content section */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              {t('common.loading')}
            </div>
          ) : !complexes?.length ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
              <p>{t('complex.filters.no_results')}</p>
              <p className="text-sm">{t('common.start_create')}</p>
              <Button onClick={() => setCreateComplexModalOpen(true)}>{t('complex.filters.create_complex')}</Button>
            </div>
          ) : (
            <ComplexGrid
              complexes={filteredComplexes || []}
              onComplexClick={(complexId) => setSelectedComplex(complexId)}
            />
          )}
        </ScrollArea>
      </div>

      <DetailsPanel
        open={!!selectedComplex}
        onClose={() => setSelectedComplex(null)}
        title={t('complex.details.title')}
      >
        {complexDetailsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner className="size-8" />
          </div>
        ) : complexDetails ? (
          <ComplexDetail complex={complexDetails} />
        ) : null}
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
