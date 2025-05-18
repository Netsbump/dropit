import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../shared/utils/auth';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect based on authentication status
    if (isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      });
    }

    // Redirect to login if not authenticated
    throw redirect({
      to: '/login',
    });
  },
  component: () => null,
});
