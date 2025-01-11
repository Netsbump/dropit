import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__programs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__programs"!</div>
}
