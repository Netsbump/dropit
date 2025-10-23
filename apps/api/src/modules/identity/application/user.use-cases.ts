import { User } from '../domain/auth/user.entity';
import { IUserRepository } from './ports/user.repository.port';
import { IUserUseCases } from './ports/user-use-cases.port';

/**
 * User Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of user business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class UserUseCases implements IUserUseCases {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async getOne(userId: string): Promise<User> {
    const user = await this.userRepository.getOne(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.getOne(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    Object.assign(user, updateData);
    user.updatedAt = new Date();
    
    await this.userRepository.save(user);

    return user;
  }

  async remove(userId: string): Promise<void> {
    const user = await this.userRepository.getOne(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    await this.userRepository.remove(user);
  }
}