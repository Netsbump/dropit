import { CreateComplexCategory, UpdateComplexCategory } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';

/**
 * Complex Category Use Cases Port
 *
 * @description
 * Defines the contract for complex category business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * ComplexCategoryUseCase and injected into controllers via dependency injection.
 */
export interface IComplexCategoryUseCases {
  /**
   * Get one complex category by ID
   */
  getOne(complexCategoryId: string, organizationId: string, userId: string): Promise<ComplexCategory>;

  /**
   * Get all complex categories for an organization
   */
  getAll(organizationId: string, userId: string): Promise<ComplexCategory[]>;

  /**
   * Create a new complex category
   */
  create(data: CreateComplexCategory, organizationId: string, userId: string): Promise<ComplexCategory>;

  /**
   * Update a complex category
   */
  update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string): Promise<ComplexCategory>;

  /**
   * Delete a complex category
   */
  delete(complexCategoryId: string, organizationId: string, userId: string): Promise<void>;
}

/**
 * Injection token for IComplexCategoryUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const COMPLEX_CATEGORY_USE_CASES = Symbol('COMPLEX_CATEGORY_USE_CASES');
