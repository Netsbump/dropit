import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DashboardCarousel from './DashboardCarousel';
import BottomNavigation from './BottomNavigation';
import AccountScreen from './AccountScreen';
import PRScreen from './PRScreen';
import TrainingScreen from './TrainingScreen';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'pr' | 'dashboard' | 'account'>('dashboard');
  const [showTraining, setShowTraining] = useState(false);


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
        <Text style={styles.greeting}>Bonjour, Clovis</Text>
      </View>

      {/* Carousel Content */}
      <View style={styles.carouselContainer}>
        <DashboardCarousel onTrainingPress={handleTrainingPress} />
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
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