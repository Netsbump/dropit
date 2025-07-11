import { ComplexCategory } from '../../domain/complex-category.entity';

export const COMPLEX_CATEGORY_REPO = Symbol('COMPLEX_CATEGORY_REPO');

export interface IComplexCategoryRepository {
  getOne(id: string): Promise<ComplexCategory | null>;
  getAll(): Promise<ComplexCategory[]>;
  save(complexCategory: ComplexCategory): Promise<void>;
  remove(complexCategory: ComplexCategory): Promise<void>;
} 