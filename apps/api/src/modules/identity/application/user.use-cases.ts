import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/auth/user.entity';
import { IUserRepository, USER_REPO } from './ports/user.repository';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserRepository,
  ) {}

  async getOne(userId: string): Promise<User> {
    const user = await this.userRepository.getOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.getOne(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    Object.assign(user, updateData);
    user.updatedAt = new Date();
    
    await this.userRepository.save(user);

    return user;
  }

  async remove(userId: string): Promise<void> {
    const user = await this.userRepository.getOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepository.remove(user);
  }
}