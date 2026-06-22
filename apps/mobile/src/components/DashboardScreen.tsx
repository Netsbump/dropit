import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DashboardCarousel from './DashboardCarousel';
import BottomNavigation from './BottomNavigation';
import AccountScreen from './AccountScreen';
import PRScreen from './PRScreen';
import TrainingScreen from './TrainingScreen';
import { authClient } from '../lib/auth-client';
import { api } from '../lib/api';
import type { AthleteDetailsDto } from '@dropit/schemas';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'pr' | 'dashboard' | 'account'>(
    'dashboard'
  );
  const [showTraining, setShowTraining] = useState(false);
  const [athleteData, setAthleteData] = useState<AthleteDetailsDto | null>(
    null
  );

  // Fetch athlete data from the current session athlete id.
  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const sessionData = await authClient.getSession();
        const athleteId = sessionData.data?.session?.athleteId;
        if (!athleteId) return;

        const response = await api.athlete.getAthlete({
          params: { id: athleteId },
        });

        const data =
          typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body;

        if (response.status === 200) {
          setAthleteData(data);
        }
      } catch (error) {
        console.error('Error fetching athlete data:', error);
      }
    };

    fetchAthleteData();
  }, []);

  const handleTabPress = (tab: 'pr' | 'dashboard' | 'account') => {
    setActiveTab(tab);
    setShowTraining(false); // Close training screen when switching tabs
  };

  const handleTrainingPress = () => {
    setShowTraining(true);
  };

  const handleBackFromTraining = () => {
    setShowTraining(false);
  };

  // Render Training Screen
  if (showTraining && activeTab === 'dashboard') {
    return <TrainingScreen onBack={handleBackFromTraining} />;
  }

  // Render PR Screen
  if (activeTab === 'pr') {
    return <PRScreen onTabPress={handleTabPress} />;
  }

  // Render Account Screen
  if (activeTab === 'account') {
    return <AccountScreen onTabPress={handleTabPress} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>DROPIT</Text>
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          Bonjour, {athleteData?.firstName || 'Athlète'}
        </Text>
      </View>

      {/* Carousel Content */}
      <View style={styles.carouselContainer}>
        <DashboardCarousel onTrainingPress={handleTrainingPress} />
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191d26',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  greetingContainer: {
    paddingHorizontal: 22, // Same alignment as cards (20px padding + 2px for visual alignment)
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
