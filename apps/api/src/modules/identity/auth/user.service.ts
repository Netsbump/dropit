import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './auth.entity';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Récupère un utilisateur par son ID
   * @param userId - ID de l'utilisateur
   * @returns L'utilisateur
   * @throws NotFoundException si l'utilisateur n'est pas trouvé
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Récupère un utilisateur par son email
   * @param email - Email de l'utilisateur
   * @returns L'utilisateur ou null
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  /**
   * Vérifie si un utilisateur existe
   * @param userId - ID de l'utilisateur
   * @returns true si l'utilisateur existe
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await this.em.findOne(User, { id: userId });
    return !!user;
  }

  /**
   * Met à jour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param updateData - Données à mettre à jour
   * @returns L'utilisateur mis à jour
   */
  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId);
    
    Object.assign(user, updateData);
    user.updatedAt = new Date();
    
    await this.em.persistAndFlush(user);
    return user;
  }

  /**
   * Supprime un utilisateur
   * @param userId - ID de l'utilisateur
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    await this.em.removeAndFlush(user);
  }
}