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
import { ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react-native';
import type { WorkoutDto } from '@dropit/schemas';

interface TrainingDetailScreenProps {
  onBack: () => void;
  element: WorkoutDto['elements'][number];
}

export default function TrainingDetailScreen({
  onBack,
  element
}: TrainingDetailScreenProps) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Extract display info from element
  const name = element.type === 'exercise'
    ? element.exercise.name
    : element.complex.exercises.map((e: { name: string }) => e.name).join(', ');
  const sets = `${element.sets} x ${element.reps}`;
  const weight = element.startWeight_percent ? `${element.startWeight_percent}%` : '-';
  const recovery = element.rest ? `${element.rest}sec` : '2min';
  const instructions = element.description || `Instructions pour ${name}.`;
  const videoUrl = element.type === 'exercise' ? element.exercise.video : undefined;

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
    let interval: ReturnType<typeof setInterval>;
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
      const recoverySeconds = parseRecoveryTime(recovery);
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

  const handleResetTimer = () => {
    setTimeLeft(0);
    setIsTimerActive(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color="#f2f6f6" size={24} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>DROPIT</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <View style={styles.playButtonOverlay}>
              <Play color="#FFFFFF" size={32} fill="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Exercise Title */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{name}</Text>
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
            {sets} répétitions - {weight} - {recovery} de repos
          </Text>

          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            {instructions}
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
            {isTimerActive ? (
              <Pause color="#FFFFFF" size={32} />
            ) : (
              <Play color="#FFFFFF" size={32} fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.fullscreenButton} onPress={handleResetTimer}>
            <RotateCcw color="#FFFFFF" size={24} />
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
    backgroundColor: '#191d26',
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
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
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
  fullscreenButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  bottomSpacing: {
    height: 40,
  },
});