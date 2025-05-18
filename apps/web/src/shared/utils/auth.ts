/**
 * Authentication utility functions
 */

import { api } from '@/lib/api';

/**
 * Check if the user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

/**
 * Get the authentication token
 * @returns The authentication token or null if not authenticated
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Configure the authorization headers for API requests
 * @returns The authorization headers
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Set the authentication token
 * @param token The authentication token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Clear the authentication token (logout)
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Get info of current user
 */
export async function getCurrentUser() {
  try {
    const response = await api.auth.me({});

    if (response.status !== 200) {
      throw new Error('Failed to get user');
    }

    return response.body;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
