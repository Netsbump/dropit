import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/athletes')({
  component: AthletesPage,
})

function AthletesPage() {
  return <div>Hello "/athletes/"!</div>
}
