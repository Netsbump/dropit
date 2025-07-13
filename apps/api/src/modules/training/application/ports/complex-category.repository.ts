import { ComplexCategory } from '../../domain/complex-category.entity';
import { CoachFilterConditions } from '../../../identity/application/ports/member.repository';

export const COMPLEX_CATEGORY_REPO = Symbol('COMPLEX_CATEGORY_REPO');

export interface IComplexCategoryRepository {
  getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<ComplexCategory | null>;
  getAll(coachFilterConditions: CoachFilterConditions): Promise<ComplexCategory[]>;
  save(complexCategory: ComplexCategory): Promise<void>;
  remove(complexCategory: ComplexCategory): Promise<void>;
} 