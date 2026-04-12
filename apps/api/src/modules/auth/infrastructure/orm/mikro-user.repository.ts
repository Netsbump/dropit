import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { User } from "../../domain/auth/user.entity";
import { IUserRepository } from "../../application/ports/user.repository.port";

@Injectable()
export class MikroUserRepository extends EntityRepository<User> implements IUserRepository {
  constructor(public readonly em: EntityManager) {
    super(em, User);
  }

  async getOne(userId: string): Promise<User | null> {
    return await this.em.findOne(User, { id: userId });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.em.findOne(User, { email });
  }

  async remove(user: User): Promise<void> {
    return await this.em.removeAndFlush(user);
  }

  async save(user: User): Promise<void> {
    return await this.em.persistAndFlush(user);
  }

}