import { ExerciseDto } from '@dropit/schemas';
import { Exercise } from '../../domain/exercise.entity';

export const ExerciseMapper = {
  toDto(exercise: Exercise): ExerciseDto {
    return {
      id: exercise.id,
      name: exercise.name,
      exerciseCategory: {
        id: exercise.exerciseCategory.id,
        name: exercise.exerciseCategory.name,
      },
      video: exercise.video?.id,
      englishName: exercise.englishName,
      shortName: exercise.shortName,
    };
  },

  toDtoList(exercises: Exercise[]): ExerciseDto[] {
    return exercises.map((exercise) => ExerciseMapper.toDto(exercise));
  },
}; 