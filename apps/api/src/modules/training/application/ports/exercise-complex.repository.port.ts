import { ExerciseComplex } from '../../domain/exercise-complex.entity';

export const EXERCISE_COMPLEX_REPO = 'EXERCISE_COMPLEX_REPO';

export interface IExerciseComplexRepository {
  remove(exerciseComplex: ExerciseComplex): Promise<void>;
  removeMany(exerciseComplexes: ExerciseComplex[]): Promise<void>;
} 