import { ComplexDto } from '@dropit/schemas';
import { Complex } from '../../domain/complex.entity';

export const ComplexMapper = {
  toDto(complex: Complex): ComplexDto {
    return {
      id: complex.id,
      complexCategory: {
        id: complex.complexCategory.id,
        name: complex.complexCategory.name,
      },
      exercises: complex.exercises.getItems().map((exerciseComplex) => {
        const exercise = exerciseComplex.exercise;
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
          order: exerciseComplex.order,
        };
      }),
    };
  },

  toDtoList(complexes: Complex[]): ComplexDto[] {
    return complexes.map((complex) => ComplexMapper.toDto(complex));
  },
}; 