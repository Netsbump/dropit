import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './AuthProvider';
import BottomNavigation from './BottomNavigation';

interface AccountScreenProps {
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

export default function AccountScreen({ onTabPress }: AccountScreenProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const handlePlaceholderPress = (feature: string) => {
    Alert.alert('Fonctionnalité', `${feature} - À implémenter`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Compte</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Modifier le profil')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.profileIcon]} />
              <Text style={styles.menuItemText}>Modifier mon profil</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Changer la photo')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.cameraIcon]} />
              <Text style={styles.menuItemText}>Photo de profil</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Notifications')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.notificationIcon]} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Langue')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.languageIcon]} />
              <Text style={styles.menuItemText}>Langue</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Thème')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.themeIcon]} />
              <Text style={styles.menuItemText}>Thème</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>
        </View>

        {/* Training Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entraînement</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Objectifs')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.targetIcon]} />
              <Text style={styles.menuItemText}>Mes objectifs</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Historique')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.historyIcon]} />
              <Text style={styles.menuItemText}>Historique complet</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Aide')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.helpIcon]} />
              <Text style={styles.menuItemText}>Centre d\'aide</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePlaceholderPress('Contact')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.contactIcon]} />
              <Text style={styles.menuItemText}>Nous contacter</Text>
            </View>
            <View style={styles.chevronRight} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={[styles.section, styles.logoutSection]}>
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, styles.logoutIcon]} />
              <Text style={[styles.menuItemText, styles.logoutText]}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for safe area */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="account"
        onTabPress={onTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191d26',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#282c38',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#414551',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  chevronRight: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
  },

  // Icon styles
  profileIcon: { backgroundColor: '#3498DB' },
  cameraIcon: { backgroundColor: '#E74C3C' },
  notificationIcon: { backgroundColor: '#F39C12' },
  languageIcon: { backgroundColor: '#9B59B6' },
  themeIcon: { backgroundColor: '#1ABC9C' },
  targetIcon: { backgroundColor: '#E67E22' },
  historyIcon: { backgroundColor: '#34495E' },
  helpIcon: { backgroundColor: '#2ECC71' },
  contactIcon: { backgroundColor: '#E91E63' },
  logoutIcon: { backgroundColor: '#E74C3C' },

  // Logout specific styles
  logoutSection: {
    marginTop: 16,
  },
  logoutItem: {
    backgroundColor: '#282c38',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});