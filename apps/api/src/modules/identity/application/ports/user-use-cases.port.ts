import { User } from '../../domain/auth/user.entity';

/**
 * User Use Cases Port
 *
 * @description
 * Defines the contract for user business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 */
export interface IUserUseCases {
  /**
   * Get one user by ID
   */
  getOne(userId: string): Promise<User>;

  /**
   * Get user by email
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Update user
   */
  update(userId: string, updateData: Partial<User>): Promise<User>;

  /**
   * Remove user
   */
  remove(userId: string): Promise<void>;
}

/**
 * Injection token for IUserUseCases
 */
export const USER_USE_CASES = Symbol('USER_USE_CASES');
