import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { authClient } from '../lib/auth-client';
import { athleteSchema } from '@dropit/schemas';

export default function DashboardScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await authClient.signOut();
              // L'AuthProvider détectera automatiquement la déconnexion
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const testSchemaValidation = () => {
    try {
      const testAthlete = athleteSchema.parse({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        organizationId: 'org-1'
      });
      
      Alert.alert(
        'Test Schema',
        `✅ Validation réussie!\nAthlete: ${testAthlete.firstName} ${testAthlete.lastName}`
      );
    } catch (error) {
      Alert.alert('Test Schema', '❌ Erreur de validation');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Bienvenue sur DropIt Mobile!</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏋️ Entraînements</Text>
          <Text style={styles.cardDescription}>
            Gérez vos séances d'entraînement
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Athlètes</Text>
          <Text style={styles.cardDescription}>
            Suivez vos performances et progrès
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Statistiques</Text>
          <Text style={styles.cardDescription}>
            Analysez vos résultats d'entraînement
          </Text>
        </View>

        {/* Test button pour vérifier les packages partagés */}
        <TouchableOpacity style={styles.testButton} onPress={testSchemaValidation}>
          <Text style={styles.testButtonText}>Tester Schema Partagé</Text>
        </TouchableOpacity>
      </View>

      {/* Footer avec bouton de déconnexion */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});