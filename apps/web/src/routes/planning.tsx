import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/planning')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/"!</div>
}
