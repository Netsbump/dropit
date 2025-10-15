import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__home/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8">
      <div>Profile page</div>
    </div>
  )
}
