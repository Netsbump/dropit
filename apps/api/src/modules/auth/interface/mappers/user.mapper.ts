import { UserDto } from '@dropit/schemas';
import { User } from '../../domain/auth/user.entity';

export const UserMapper = {
  toDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
