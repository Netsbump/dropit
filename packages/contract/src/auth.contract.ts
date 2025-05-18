import {
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  SignupRequestSchema,
  SuccessResponseSchema,
  UserSchema,
} from '@dropit/schemas';

export const authContract = {
  login: {
    method: 'POST',
    path: '/auth/login',
    body: LoginRequestSchema,
    responses: {
      200: LoginResponseSchema,
    },
    summary: 'User login',
  },

  signup: {
    method: 'POST',
    path: '/auth/signup',
    body: SignupRequestSchema,
    responses: {
      200: LoginResponseSchema,
    },
    summary: 'User registration',
  },

  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: LogoutRequestSchema,
    responses: {
      200: SuccessResponseSchema,
    },
    summary: 'User logout',
  },

  me: {
    method: 'GET',
    path: '/auth/me',
    responses: {
      200: UserSchema,
    },
    summary: 'Get current user info',
  },
} as const;
