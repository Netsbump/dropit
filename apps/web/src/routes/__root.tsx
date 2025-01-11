import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Dropit
        </Link>
        <Link to="/programs" className="[&.active]:font-bold">
          Programmation
        </Link>
        <Link to="/planning" className="[&.active]:font-bold">
          Calendrier
        </Link>
        <Link to="/athletes" className="[&.active]:font-bold">
          Athlètes
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          Aide & Support
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
