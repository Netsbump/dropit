import { User } from "../../domain/auth/user.entity";

export const USER_REPO = Symbol('USER_REPO');

export interface IUserRepository {
  getOne(userId: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  remove(user: User): Promise<void>;
  save(user: User): Promise<void>;
}

