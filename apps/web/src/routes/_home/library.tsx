import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_home/library')({
  component: LibraryLayout,
});

function LibraryLayout() {
  return <Outlet />;
}
