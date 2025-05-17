import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__home/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  return <div>Hello "/dashboard"!</div>;
}
