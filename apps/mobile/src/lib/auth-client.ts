import { createAuthClient } from 'better-auth/react';
import { organizationClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { ac, owner, admin, member } from '@dropit/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration du client d'authentification pour React Native
export const authClient = createAuthClient({
  baseURL: 'http://192.168.1.147:3000', // IP locale pour mobile
  plugins: [
    organizationClient({
      // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
      ac: ac as any,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    inferAdditionalFields({
      session: {
        athleteId: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
  // Configuration pour React Native avec AsyncStorage
  storage: {
    get: async (key: string) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
    set: async (key: string, value: any) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore storage errors
      }
    },
    remove: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    },
  },
  // Support du Bearer token pour mobile
  fetchOptions: {
    credentials: 'include',
  },
});