export const TRANSPORT = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push'
} as const;

export type Transport = (typeof TRANSPORT)[keyof typeof TRANSPORT];

