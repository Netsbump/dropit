import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import TrainingDetailScreen from './TrainingDetailScreen';
import { authClient } from '../lib/auth-client';
import { api } from '../lib/api';
import type { TrainingSessionDto, WorkoutDto } from '@dropit/schemas';

interface TrainingScreenProps {
  onBack: () => void;
}

// Helper to generate array of dates (3 before, today, 3 after)
const generateDateRange = (centerDate: Date) => {
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Format date to YYYY-MM-DD for API
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date to "LUNDI 6 OCTOBRE 2025"
const formatDateFull = (date: Date): string => {
  const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const months = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName} ${day} ${month} ${year}`;
};

// Generate fixed date range once (3 days before today, today, 3 days after)
const dateRange = generateDateRange(new Date());

export default function TrainingScreen({ onBack }: TrainingScreenProps) {
  const [selectedElement, setSelectedElement] = useState<WorkoutDto['elements'][number] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allTrainingSessions, setAllTrainingSessions] = useState<TrainingSessionDto[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [athleteId, setAthleteId] = useState<string | null>(null);

  // Fetch athleteId from session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData.data?.session?.athleteId) {
          setAthleteId(sessionData.data.session.athleteId);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  // Fetch all training sessions for the date range when athleteId is available
  useEffect(() => {
    const fetchAllTrainingSessions = async () => {
      if (!athleteId) return;

      setIsLoading(true);
      try {
        const startDate = formatDateForAPI(dateRange[0]);
        const endDate = formatDateForAPI(dateRange[dateRange.length - 1]);

        const response = await api.trainingSession.getTrainingSessionsByAthlete({
          params: { athleteId },
          query: { startDate, endDate },
        });

        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

        if (response.status === 200) {
          setAllTrainingSessions(data);
          // Set training data for selected date
          const selectedDateString = selectedDate.toDateString();
          const sessionForDate = data.find((session: TrainingSessionDto) => {
            const sessionDate = new Date(session.scheduledDate);
            return sessionDate.toDateString() === selectedDateString;
          });
          setTrainingData(sessionForDate || null);
        }
      } catch (error) {
        console.error('Error fetching training sessions:', error);
        setAllTrainingSessions([]);
        setTrainingData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTrainingSessions();
  }, [athleteId, selectedDate]);

  // Update training data when selected date changes
  useEffect(() => {
    if (allTrainingSessions.length === 0) {
      setTrainingData(null);
      return;
    }

    const sessionForDate = allTrainingSessions.find((session: TrainingSessionDto) => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });

    setTrainingData(sessionForDate || null);
  }, [selectedDate, allTrainingSessions]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleExercisePress = (element: WorkoutDto['elements'][number]) => {
    setSelectedElement(element);
  };

  const handleBackFromDetail = () => {
    setSelectedElement(null);
  };

  // If an element is selected, show the detail screen
  if (selectedElement) {
    return (
      <TrainingDetailScreen
        onBack={handleBackFromDetail}
        element={selectedElement}
      />
    );
  }

  const renderExerciseBlock = (element: WorkoutDto['elements'][number], displayInfo: { id: string; name: string; sets: string; weight: string; recovery: string }) => (
    <TouchableOpacity
      key={displayInfo.id}
      style={styles.exerciseBlock}
      onPress={() => handleExercisePress(element)}
      activeOpacity={0.8}
    >
      {/* Exercise Image Placeholder */}
      <View style={styles.exerciseImage}>
        <View style={[
          styles.imagePlaceholder,
          element.type === 'complex' ? styles.complexImagePlaceholder : styles.exerciseImagePlaceholder
        ]} />
      </View>

      {/* Exercise Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{displayInfo.name}</Text>
        <View style={styles.exerciseDetails}>
          <Text style={styles.detailText}>
            {displayInfo.sets} • {displayInfo.weight} • {displayInfo.recovery}
          </Text>
        </View>
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <ChevronRight color="#a7acae" size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color="#f2f6f6" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Entraînement</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Date Carousel */}
      <View style={styles.dateCarouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateCarousel}
        >
          {dateRange.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayNumber = date.getDate();
            const monthName = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'][date.getMonth()];
            const dateKey = date.toISOString();

            // Check if this date has a training session
            const hasTraining = allTrainingSessions.some((session: TrainingSessionDto) => {
              const sessionDate = new Date(session.scheduledDate);
              return sessionDate.toDateString() === date.toDateString();
            });

            return (
              <TouchableOpacity
                key={dateKey}
                style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                onPress={() => handleDateSelect(date)}
              >
                <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                  {dayNumber}
                </Text>
                <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                  {monthName}.
                </Text>
                {hasTraining && (
                  <View style={styles.trainingIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Full Date Title */}
      <View style={styles.fullDateContainer}>
        <Text style={styles.fullDateText}>{formatDateFull(selectedDate)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chargement...</Text>
          </View>
        ) : trainingData ? (
          <>
            {/* Training Info */}
            <View style={styles.trainingInfo}>
              {trainingData.workout?.description && (
                <Text style={styles.trainingDescription}>{trainingData.workout.description}</Text>
              )}
            </View>

            {/* Exercise List */}
            <View style={styles.exerciseList}>
              {trainingData.workout?.elements?.map((element: WorkoutDto['elements'][number]) => {
                const id = element.type === 'exercise' ? element.exercise.id : element.complex.id;
                const name = element.type === 'exercise'
                  ? element.exercise.name
                  : element.complex.exercises.map((e: { name: string }) => e.name).join(', ');

                return renderExerciseBlock(element, {
                  id,
                  name,
                  sets: `${element.sets} x ${element.reps}`,
                  weight: element.startWeight_percent ? `${element.startWeight_percent}%` : '-',
                  recovery: element.rest ? `${element.rest}sec` : '-',
                });
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Pas d'entraînement</Text>
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore d'entraînement de planifié pour cette date, veuillez attendre que votre coach vous en assigne.
            </Text>
          </View>
        )}

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
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f2f6f6',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },

  // Date Carousel
  dateCarouselContainer: {
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
  },
  dateCarousel: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 70,
  },
  dateItemSelected: {
    backgroundColor: '#282c38',
    borderWidth: 1,
    borderColor: '#6387d9'
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#91989a',
    marginBottom: 4,
  },
  dateNumberSelected: {
    color: '#f2f6f6',
  },
  dateMonth: {
    fontSize: 12,
    color: '#91989a',
    fontWeight: '600',
  },
  dateMonthSelected: {
    color: '#f2f6f6',
  },
  trainingIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },

  // Full Date Title
  fullDateContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fullDateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f2f6f6',
    textAlign: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Training Info
  trainingInfo: {
    marginBottom: 24,
  },
  trainingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eff4f8',
    textAlign: 'center',
    marginBottom: 8,
  },
  trainingDescription: {
    fontSize: 14,
    color: '#a7acae',
    textAlign: 'center',
    marginBottom: 12,
  },
  trainingSubtitle: {
    fontSize: 16,
    color: '#a7acae',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f2f6f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#a9acae',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Exercise List
  exerciseList: {
    gap: 16,
  },
  exerciseBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282c38',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#414551'
  },

  // Exercise Image
  exerciseImage: {
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  exerciseImagePlaceholder: {
    backgroundColor: '#3498DB',
  },
  complexImagePlaceholder: {
    backgroundColor: '#E74C3C',
  },

  // Exercise Info
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#eff4f8',
    marginBottom: 6,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#a7acae',
    fontWeight: '400',
  },

  // Arrow
  arrowContainer: {
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpacing: {
    height: 40,
  },
});