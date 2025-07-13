import type { ExecutionContext } from '@nestjs/common';
import { SetMetadata, createParamDecorator } from '@nestjs/common';
import { User } from 'better-auth';

export const BEFORE_HOOK_KEY = Symbol('BEFORE_HOOK');
export const AFTER_HOOK_KEY = Symbol('AFTER_HOOK');
export const HOOK_KEY = Symbol('HOOK');

/**
 * Type pour l'utilisateur connecté avec les champs étendus de notre application
 */
export interface AuthenticatedUser extends User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Décorateur pour marquer une route comme publique (accessible sans authentification)
 */
export const Public = () => SetMetadata('PUBLIC', true);

/**
 * Décorateur pour marquer une route comme optionnelle (accessible avec ou sans authentification)
 */
export const Optional = () => SetMetadata('OPTIONAL', true);

/**
 * Décorateur pour injecter la session dans un contrôleur
 */
export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.session;
  }
);

/**
 * Décorateur pour injecter l'utilisateur connecté dans un contrôleur
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
);

/**
 * Décorateur pour définir un hook qui s'exécute avant une route d'authentification
 */
export function BeforeHook(path: `/${string}`) {
  return SetMetadata(BEFORE_HOOK_KEY, path);
}

/**
 * Décorateur pour définir un hook qui s'exécute après une route d'authentification
 */
export function AfterHook(path: `/${string}`) {
  return SetMetadata(AFTER_HOOK_KEY, path);
}

/**
 * Décorateur pour marquer une classe comme hook d'authentification
 */
export const Hook = () => SetMetadata(HOOK_KEY, true);
