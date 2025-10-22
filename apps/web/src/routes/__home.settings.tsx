import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from '@dropit/i18n'
import { usePageMeta } from '../shared/hooks/use-page-meta'
import { useEffect } from 'react'

export const Route = createFileRoute('/__home/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { setPageMeta } = usePageMeta()

  useEffect(() => {
    setPageMeta({ title: t('sidebar.menu.settings') })
  }, [setPageMeta, t])

  return <div className="p-4">Hello "/__home/settings"!</div>
}
