import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { authClient } from '../lib/auth-client';
import LoginScreen from './LoginScreen';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    activeOrganizationId?: string | null;
  };
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Attendre un peu pour éviter les erreurs d'initialisation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Récupérer la session actuelle
      const sessionData = await authClient.getSession();
      
      if (sessionData.data) {
        console.log('Session found:', sessionData.data.user.email);
        setSession(sessionData.data);
      } else {
        console.log('No session found');
        setSession(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const handleLoginSuccess = async () => {
    // Rafraîchir la session après connexion réussie
    await initializeAuth();
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Écran de chargement initial
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  // Si pas de session, afficher l'écran de connexion
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Session active, afficher l'app
  return (
    <View style={styles.container}>
      {children}
      {/* Vous pouvez ajouter un bouton de déconnexion ici pour les tests */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});