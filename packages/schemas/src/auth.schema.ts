import { z } from 'zod';

export enum UserRole {
  ATHLETE = 'athlete',
  COACH = 'coach',
  ADMIN = 'admin',
}

// Schémas de requêtes
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const ConfirmResetPasswordRequestSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

// Pour le logout, généralement aucun body n'est requis ou un body vide
export const LogoutRequestSchema = z.object({}).optional();

// Une réponse de succès simple
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Schémas de réponses
export const TokensSchema = z.object({
  access: z.string(),
  refresh: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isVerified: z.boolean().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const LoginResponseSchema = z.object({
  tokens: TokensSchema,
  user: UserSchema,
});

export const AuthSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  createdAt: z.date().or(z.string()),
  expiresAt: z.date().or(z.string()),
  isActive: z.boolean(),
});

// Types TypeScript dérivés des schémas Zod
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ConfirmResetPasswordRequest = z.infer<
  typeof ConfirmResetPasswordRequestSchema
>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export type Tokens = z.infer<typeof TokensSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
