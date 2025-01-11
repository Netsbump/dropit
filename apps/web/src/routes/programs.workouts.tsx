import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/programs/workouts')({
  component: WorkoutPage,
})

function WorkoutPage() {
  return <div>Hello "/programs/workout"!</div>
}
