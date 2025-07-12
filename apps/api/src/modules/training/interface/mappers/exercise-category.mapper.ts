import { ExerciseCategoryDto } from '@dropit/schemas';
import { ExerciseCategory } from '../../domain/exercise-category.entity';

export const ExerciseCategoryMapper = {
  toDto(exerciseCategory: ExerciseCategory): ExerciseCategoryDto {
    return {
      id: exerciseCategory.id,
      name: exerciseCategory.name,
    };
  },

  toDtoList(exerciseCategories: ExerciseCategory[]): ExerciseCategoryDto[] {
    return exerciseCategories.map((exerciseCategory) => ExerciseCategoryMapper.toDto(exerciseCategory));
  },
};