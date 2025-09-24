import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface TrainingDetailScreenProps {
  onBack: () => void;
  exerciseData?: {
    name: string;
    sets: string;
    weight: string;
    recovery: string;
    instructions: string;
    videoUrl?: string;
  };
}

export default function TrainingDetailScreen({
  onBack,
  exerciseData = {
    name: "Arraché",
    sets: "5 x 3",
    weight: "75%",
    recovery: "2min",
    instructions: "Départ en dessous du genou et on termine au dessus de la tête. On se concentre sur montée lente et contrôlée. Deux secondes de pause à mi-cuisse.",
  }
}: TrainingDetailScreenProps) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Parse recovery time to seconds
  const parseRecoveryTime = (recovery: string) => {
    if (recovery.includes('min')) {
      const minutes = parseInt(recovery);
      const seconds = recovery.includes('sec') ? parseInt(recovery.split('min')[1]) || 0 : 0;
      return minutes * 60 + seconds;
    }
    return parseInt(recovery) || 120; // default 2 minutes
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      Alert.alert('Temps écoulé !', 'Temps de repos terminé');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTimer = () => {
    if (!isTimerActive) {
      const recoverySeconds = parseRecoveryTime(exerciseData.recovery);
      setTimeLeft(recoverySeconds);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  };

  const handleTimerSelect = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    if (isTimerActive) {
      setIsTimerActive(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>DROPIT</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <View style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <View style={styles.playButtonOverlay}>
              <View style={styles.playIcon} />
            </View>
          </View>
        </View>

        {/* Exercise Title */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{exerciseData.name}</Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>
            {isTimerActive || timeLeft > 0 ? formatTime(timeLeft) : '0 To 90'}
          </Text>
        </View>

        {/* Time Selection Buttons */}
        <View style={styles.timeButtonsContainer}>
          <TouchableOpacity
            style={[styles.timeButton, timeLeft === 60 && styles.activeTimeButton]}
            onPress={() => handleTimerSelect(1)}
          >
            <Text style={[styles.timeButtonText, timeLeft === 60 && styles.activeTimeButtonText]}>
              1 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, timeLeft === 120 && styles.activeTimeButton]}
            onPress={() => handleTimerSelect(2)}
          >
            <Text style={[styles.timeButtonText, timeLeft === 120 && styles.activeTimeButtonText]}>
              2 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, timeLeft === 180 && styles.activeTimeButton]}
            onPress={() => handleTimerSelect(3)}
          >
            <Text style={[styles.timeButtonText, timeLeft === 180 && styles.activeTimeButtonText]}>
              3 min
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Stimulus</Text>
          <Text style={styles.exerciseSubtitle}>
            {exerciseData.sets} répétitions - {exerciseData.weight} - {exerciseData.recovery} de repos
          </Text>

          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            {exerciseData.instructions}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.easyModeButton}>
            <Text style={styles.easyModeText}>Easy{'\n'}Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isTimerActive && styles.activePlayButton]}
            onPress={handlePlayTimer}
          >
            <View style={isTimerActive ? styles.pauseIcon : styles.playIconLarge} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fullscreenButton}>
            <View style={styles.fullscreenIcon} />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    flex: 1,
  },

  // Video Section
  videoContainer: {
    height: 300,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3A3A',
  },
  playButtonOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#1A1A1A',
    marginLeft: 4,
  },

  // Exercise Header
  exerciseHeader: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Timer Display
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Time Buttons
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  timeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTimeButton: {
    borderColor: '#4A9EFF',
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTimeButtonText: {
    color: '#4A9EFF',
  },

  // Details Section
  detailsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },

  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  easyModeButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  easyModeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#4A9EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlayButton: {
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
  },
  playIconLarge: {
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftWidth: 24,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#4A9EFF',
    marginLeft: 4,
  },
  pauseIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4A9EFF',
  },
  fullscreenButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  fullscreenIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
  },

  bottomSpacing: {
    height: 40,
  },
});