import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/programs/complex')({
  component: ComplexPage,
})

function ComplexPage() {
  return <div>Hello "/programs/complex/"!</div>
}
