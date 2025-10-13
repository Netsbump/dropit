import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__home/help')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__home/help"!</div>
}
