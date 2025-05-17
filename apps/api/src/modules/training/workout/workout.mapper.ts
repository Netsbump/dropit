import { WorkoutDto } from '@dropit/schemas';
import { WORKOUT_ELEMENT_TYPES } from '../workout-element/workout-element.entity';
import { Workout } from './workout.entity';

export const WorkoutMapper = {
  toDto(workout: Workout): WorkoutDto {
    const formattedElements = [];

    for (const element of workout.elements.getItems()) {
      const baseElement = {
        id: element.id,
        order: element.order,
        reps: element.reps,
        sets: element.sets,
        rest: element.rest,
        startWeight_percent: element.startWeight_percent,
      };

      if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE && element.exercise) {
        formattedElements.push({
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
        });
      } else if (
        element.type === WORKOUT_ELEMENT_TYPES.COMPLEX &&
        element.complex
      ) {
        formattedElements.push({
          ...baseElement,
          type: 'complex' as const,
          complex: {
            id: element.complex.id,
            name: element.complex.name,
            description: element.complex.description,
            complexCategory: {
              id: element.complex.complexCategory.id,
              name: element.complex.complexCategory.name,
            },
            exercises: element.complex.exercises.getItems().map((ex) => ({
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
        });
      }
    }

    return {
      id: workout.id,
      title: workout.title,
      workoutCategory: workout.category.name,
      description: workout.description,
      elements: formattedElements,
    };
  },

  toListDto(workouts: Workout[]): WorkoutDto[] {
    return workouts.map(this.toDto);
  },
};
