import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Link, useMatches } from '@tanstack/react-router';

const routeNames: Record<string, string> = {
  '/': 'Tableau de bord',
  '/programs': 'Programmation',
  '/programs/exercises': 'Exercices',
  '/programs/complex': 'Complexes',
  '/planning': 'Calendrier',
  '/athletes': 'Athlètes',
  '/about': 'Aide & Support',
};

export function Breadcrumbs() {
  const matches = useMatches();
  const breadcrumbs = matches.map((match) => ({
    title: routeNames[match.pathname] || match.pathname,
    path: match.pathname,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={crumb.path}>
              {!isLast ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.title}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
