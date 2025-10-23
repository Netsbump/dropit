import { CreateComplex, UpdateComplex } from '@dropit/schemas';
import { Complex } from '../../domain/complex.entity';

/**
 * Complex Use Cases Port
 *
 * @description
 * Defines the contract for complex business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * ComplexUseCase and injected into controllers via dependency injection.
 */
export interface IComplexUseCases {
  /**
   * Get one complex by ID
   */
  getOne(complexId: string, organizationId: string, userId: string): Promise<Complex>;

  /**
   * Get all complexes for an organization
   */
  getAll(organizationId: string, userId: string): Promise<Complex[]>;

  /**
   * Create a new complex
   */
  create(data: CreateComplex, userId: string, organizationId: string): Promise<Complex>;

  /**
   * Update a complex
   */
  update(complexId: string, data: UpdateComplex, userId: string, organizationId: string): Promise<Complex>;

  /**
   * Delete a complex
   */
  delete(complexId: string, userId: string, organizationId: string): Promise<void>;
}

/**
 * Injection token for IComplexUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const COMPLEX_USE_CASES = Symbol('COMPLEX_USE_CASES');
