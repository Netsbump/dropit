import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TrainingDetailScreen from './TrainingDetailScreen';

interface TrainingScreenProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  type: 'exercise' | 'complex';
  sets: string;
  weight: string;
  recovery: string;
  image?: string;
}

const mockTrainingData: Exercise[] = [
  {
    id: '1',
    name: 'Arraché',
    type: 'exercise',
    sets: '5 x 3',
    weight: '75%',
    recovery: '2min',
  },
  {
    id: '2',
    name: 'Squat Nuque',
    type: 'exercise',
    sets: '4 x 5',
    weight: '80kg',
    recovery: '90sec',
  },
  {
    id: '3',
    name: 'Complex Force',
    type: 'complex',
    sets: '3 tours',
    weight: '70%',
    recovery: '3min',
  },
  {
    id: '4',
    name: 'Epaulé-Jetté',
    type: 'exercise',
    sets: '6 x 2',
    weight: '70%',
    recovery: '2min30',
  },
  {
    id: '5',
    name: 'Tirage Arraché',
    type: 'exercise',
    sets: '4 x 4',
    weight: '85kg',
    recovery: '60sec',
  },
  {
    id: '6',
    name: 'Complex Technique',
    type: 'complex',
    sets: '4 tours',
    weight: '50%',
    recovery: '2min',
  },
];

export default function TrainingScreen({ onBack }: TrainingScreenProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  // Get current date formatted as dd/mm/yyyy
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleBackFromDetail = () => {
    setSelectedExercise(null);
  };

  // If an exercise is selected, show the detail screen
  if (selectedExercise) {
    return (
      <TrainingDetailScreen
        onBack={handleBackFromDetail}
        exerciseData={{
          name: selectedExercise.name,
          sets: selectedExercise.sets,
          weight: selectedExercise.weight,
          recovery: selectedExercise.recovery,
          instructions: `Instructions détaillées pour ${selectedExercise.name}. Départ en position de base et exécution contrôlée du mouvement selon la technique appropriée.`,
        }}
      />
    );
  }

  const renderExerciseBlock = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseBlock}
      onPress={() => handleExercisePress(exercise)}
      activeOpacity={0.8}
    >
      {/* Exercise Image Placeholder */}
      <View style={styles.exerciseImage}>
        <View style={[
          styles.imagePlaceholder,
          exercise.type === 'complex' ? styles.complexImagePlaceholder : styles.exerciseImagePlaceholder
        ]} />
      </View>

      {/* Exercise Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.exerciseDetails}>
          <Text style={styles.detailText}>
            {exercise.sets} • {exercise.weight} • {exercise.recovery}
          </Text>
        </View>
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <View style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Entraînement du {getCurrentDate()}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Training Info */}
        <View style={styles.trainingInfo}>
          <Text style={styles.trainingSubtitle}>
            {mockTrainingData.length} exercices
          </Text>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          {mockTrainingData.map(exercise => renderExerciseBlock(exercise))}
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
    paddingBottom: 24,
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Training Info
  trainingInfo: {
    marginBottom: 24,
  },
  trainingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Exercise List
  exerciseList: {
    gap: 16,
  },
  exerciseBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  // Exercise Image
  exerciseImage: {
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },

  // Arrow
  arrowContainer: {
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },

  bottomSpacing: {
    height: 40,
  },
});