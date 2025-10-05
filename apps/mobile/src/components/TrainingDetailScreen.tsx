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
import { ChevronLeft, Play, RotateCcw } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
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
  const [showTimer, setShowTimer] = useState(false);

  // Extract display info from element
  const name = element.type === 'exercise'
    ? element.exercise.name
    : element.complex.exercises.map((e: { name: string }) => e.name).join(', ');
  const sets = `${element.sets} sets`;
  const reps = `${element.reps} reps`
  const weight = element.startWeight_percent ? `${element.startWeight_percent}%` : '-';
  const recovery = element.rest ? `${element.rest}sec` : '90sec';
  const instructions = element.description || `Instructions pour ${name}.`;
  const videoUrl = element.type === 'exercise' ? element.exercise.video : undefined;

  // Get default rest time in seconds (from element.rest or 90s default)
  const defaultRestTime = element.rest || 90;
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      setShowTimer(false);
      Alert.alert('Temps écoulé !', 'Temps de repos terminé');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handlePlayTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(defaultRestTime);
    }
    setIsTimerActive(true);
    setShowTimer(true);
  };

  const handleTimerPress = () => {
    setIsTimerActive(false);
    setShowTimer(false);
  };

  const handleResetTimer = () => {
    setTimeLeft(0);
    setIsTimerActive(false);
    setShowTimer(false);
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

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topContent}>
          {/* Video Section */}
          <View style={styles.videoContainer}>
            <View style={styles.videoPlaceholder}>
              <View style={styles.playButtonOverlay}>
                <Play color="#FFFFFF" size={32} />
              </View>
            </View>
          </View>

          {/* Exercise Title */}
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>{name}</Text>
          </View>

          {/* Info Display */}
          <View style={styles.numbersContainer}>
            <View style={styles.numbersElement}>
              <Text style={styles.numbersText}>
                {sets}
              </Text>
            </View>
            <View style={styles.numbersElement}>
              <Text style={styles.numbersText}>
                {reps}
              </Text>
            </View>
            <View style={styles.numbersElement}>
              <Text style={styles.numbersText}>
                {weight}
              </Text>
            </View>
          </View>

          {/* Exercise Details */}
          <View style={styles.detailsContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.sectionText}>
                {instructions}
              </Text>

              <Text style={styles.sectionTitle}>Montée en charge</Text>
              <View style={styles.listContainer}>
                <View style={styles.listItem}>
                  <View style={styles.dot} />
                  <Text style={styles.listText}>2 reps à vide</Text>
                </View>
                <View style={styles.listItem}>
                  <View style={styles.dot} />
                  <Text style={styles.listText}>2 reps à 20%</Text>
                </View>
                <View style={styles.listItem}>
                  <View style={styles.dot} />
                  <Text style={styles.listText}>2 reps à 40%</Text>
                </View>
                <View style={styles.listItem}>
                  <View style={styles.dot} />
                  <Text style={styles.listText}>2 reps à 60%</Text>
                </View>
                <View style={styles.listItem}>
                  <View style={styles.dot} />
                  <Text style={styles.listText}>2 reps à 80%</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.easyModeButton}>
            <Text style={styles.chronoRestText}>Chrono{'\n'}Repos</Text>
          </TouchableOpacity>

          {showTimer ? (
            <TouchableOpacity
              style={styles.timerDisplay}
              onPress={handleTimerPress}
            >
              <Svg width={65} height={65} style={styles.progressCircle}>
                <Circle
                  cx={32.5}
                  cy={32.5}
                  r={29.5}
                  stroke="#4A9EFF"
                  strokeWidth={3}
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 29.5}`}
                  strokeDashoffset={`${2 * Math.PI * 29.5 * (1 - timeLeft / defaultRestTime)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 32.5 32.5)"
                />
              </Svg>
              <Text style={styles.timerText}>
                {timeLeft}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayTimer}
            >
              <Play color="#e9edf5" size={24} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.fullscreenButton} onPress={handleResetTimer}>
            <RotateCcw color="#e9edf5" size={24} />
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
    paddingTop: 40,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 18,
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topContent: {
    flexShrink: 1,
  },

  // Video Section
  videoContainer: {
    height: 250,
    backgroundColor: '#2A2A2A',
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
    paddingVertical: 16,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e9edf5',
    textAlign: 'center',
  },

  // Timer Display (center button)
  timerDisplay: {
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e9edf5',
  },

  // Time Buttons
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  numbersElement: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth:1,
    borderRadius: 20,
    borderColor: '#6387d9'
  },
  numbersText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e9edf5',
  },

  // Details Section
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 32,
    marginHorizontal: 12,
    backgroundColor: '#282c38',
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a2a6b2',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionText: {
    fontSize: 16,
    color: '#e9edf5',
    marginBottom: 4,
  },
  listContainer: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5d88ee',
  },
  listText: {
    fontSize: 16,
    color: '#e9edf5',
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
  chronoRestText: {
    fontSize: 12,
    color: '#e9edf5',
    textAlign: 'center',
    lineHeight: 18,
  },
  playButton: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#4A9EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  bottomSpacing: {
    height: 40,
  },
});