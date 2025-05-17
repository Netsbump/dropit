import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('auth_token');

    // Redirect based on authentication status
    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }

    // Default: redirect to login
    throw redirect({
      to: '/login',
    });
  },
  component: () => null,
});
