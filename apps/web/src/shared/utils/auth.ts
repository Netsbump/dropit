/**
 * Authentication utility functions
 */

/**
 * Check if the user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
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
