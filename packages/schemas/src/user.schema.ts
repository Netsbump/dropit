import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  image: z.string().optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  isSuperAdmin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof userSchema>;

export const deleteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().min(1, 'Confirmation is required'),
});

export type DeleteUser = z.infer<typeof deleteUserSchema>;
