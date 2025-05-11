import type { ExecutionContext } from '@nestjs/common';
import { SetMetadata, createParamDecorator } from '@nestjs/common';

export const BEFORE_HOOK_KEY = Symbol('BEFORE_HOOK');
export const AFTER_HOOK_KEY = Symbol('AFTER_HOOK');
export const HOOK_KEY = Symbol('HOOK');

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
