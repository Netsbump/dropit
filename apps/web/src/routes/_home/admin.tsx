import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { GLOBAL_ROLE } from '@dropit/schemas';
import { createFileRoute, redirect } from '@tanstack/react-router';


export const Route = createFileRoute('/_home/admin')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState()

    if (accessState.userRole !== GLOBAL_ROLE.ADMIN) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  return (
    <div>
      coucou
    </div>
  )
}
