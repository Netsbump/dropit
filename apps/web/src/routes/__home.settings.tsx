import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__home/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-8">Hello "/__home/settings"!</div>
}
