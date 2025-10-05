import { apiContract } from '@dropit/contract';
import { initClient } from '@ts-rest/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Client API pour React Native avec gestion du Bearer token
export const api = initClient(apiContract, {
  baseUrl: 'http://192.168.1.147:3000/api',
  // Configuration pour React Native
  // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
  api: async (args: any) => {
    try {
      // Récupération du token depuis AsyncStorage
      const authData = await AsyncStorage.getItem('better-auth.session-token');
      const token = authData ? JSON.parse(authData) : null;

      // Configuration des headers avec Bearer token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Effectuer la requête
      const response = await fetch(args.path, {
        method: args.method,
        headers,
        body: args.body ? JSON.stringify(args.body) : undefined,
      });

      const text = await response.text();

      return {
        status: response.status,
        body: text,
        headers: response.headers,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: 'Network error' }),
        headers: new Headers(),
      };
    }
  },
});