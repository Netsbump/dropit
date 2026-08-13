import { User } from '../domain/auth/user.entity';
import { IUserRepository } from './ports/user.repository.port';
import { IUserUseCases } from './ports/user-use-cases.port';

export class UserUseCases implements IUserUseCases {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(userId: string): Promise<User | null> {
    return await this.userRepository.getOne(userId);
  }

  async getOne(userId: string): Promise<User> {
    const user = await this.userRepository.getOne(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getByEmail(email);
  }

  async create(data: {
    name: string;
    email: string;
    emailVerified: boolean;
  }): Promise<User> {
    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.emailVerified = data.emailVerified;
    await this.userRepository.save(user);
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
