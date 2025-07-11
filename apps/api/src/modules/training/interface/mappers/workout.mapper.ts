import { WorkoutDto } from '@dropit/schemas';
import { Workout } from '../../domain/workout.entity';
import { ExerciseComplex } from '../../domain/exercise-complex.entity';

export const WorkoutMapper = {
  toDto(workout: Workout): WorkoutDto {
    const elements = workout.elements.getItems().map(element => {
      const baseElement = {
        id: element.id,
        order: element.order,
        reps: element.reps,
        sets: element.sets,
        rest: element.rest,
        startWeight_percent: element.startWeight_percent,
      };

      if (element.exercise) {
        return {
          ...baseElement,
          type: 'exercise' as const,
          exercise: {
            id: element.exercise.id,
            name: element.exercise.name,
            description: element.exercise.description,
            exerciseCategory: {
              id: element.exercise.exerciseCategory.id,
              name: element.exercise.exerciseCategory.name,
            },
            video: element.exercise.video?.id,
            englishName: element.exercise.englishName,
            shortName: element.exercise.shortName,
          },
        };
      } else {
        // La contrainte DB garantit qu'il y a soit exercise soit complex
        return {
          ...baseElement,
          type: 'complex' as const,
          complex: {
            id: element.complex!.id,
            name: element.complex!.name,
            description: element.complex!.description,
            complexCategory: {
              id: element.complex!.complexCategory.id,
              name: element.complex!.complexCategory.name,
            },
            exercises: element.complex!.exercises.getItems().map((ex: ExerciseComplex) => ({
              id: ex.exercise.id,
              name: ex.exercise.name,
              description: ex.exercise.description,
              exerciseCategory: {
                id: ex.exercise.exerciseCategory.id,
                name: ex.exercise.exerciseCategory.name,
              },
              video: ex.exercise.video?.id,
              englishName: ex.exercise.englishName,
              shortName: ex.exercise.shortName,
              order: ex.order,
              reps: ex.reps,
            })),
          },
        };
      }
    });

    return {
      id: workout.id,
      title: workout.title,
      workoutCategory: workout.category.name,
      description: workout.description,
      elements,
    };
  },

  toDtoList(workouts: Workout[]): WorkoutDto[] {
    return workouts.map(this.toDto);
  },
}
