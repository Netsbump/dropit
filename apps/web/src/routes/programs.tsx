import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from '@tanstack/react-router'

export const Route = createFileRoute('/programs')({
  component: ProgramsPage,
})

function ProgramsPage() {
  // Récupérer la route active pour définir l'onglet actif
  const matches = useMatches()
  const activeTab =
    matches[matches.length - 1].pathname.split('/').pop() || 'workouts'

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Programmation</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Retrouvez et gérez tous vos entrainements, blocs de complex et exercices
        ici
      </p>

      <div className="border-b">
        <nav className="flex gap-8">
          <Link
            to="/programs/workouts"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'workouts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Entrainements
          </Link>
          <Link
            to="/programs/complex"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'complex'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Complex
          </Link>
          <Link
            to="/programs/exercises"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'exercises'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Exercices
          </Link>
        </nav>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}
