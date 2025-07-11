import { WorkoutCategoryDto } from '@dropit/schemas';
import { WorkoutCategory } from '../../domain/workout-category.entity';

export const WorkoutCategoryMapper = {
  toDto(workoutCategory: WorkoutCategory): WorkoutCategoryDto {
    return {
      id: workoutCategory.id,
      name: workoutCategory.name,
    };
  },

  toDtoList(workoutCategories: WorkoutCategory[]): WorkoutCategoryDto[] {
    return workoutCategories.map((workoutCategory) => WorkoutCategoryMapper.toDto(workoutCategory));
  },
}; 