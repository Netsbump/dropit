import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__programs')({
  component: ProgramsLayout,
});

function ProgramsLayout() {
  return <Outlet />;
}
