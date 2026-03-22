import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__auth/login')({
  component: () => <Outlet />,
});
