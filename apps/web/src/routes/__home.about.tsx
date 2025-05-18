import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__home/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__home/about"!</div>
}
