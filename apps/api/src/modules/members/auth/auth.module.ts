import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import {
  Global,
  Inject,
  Module,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
} from '@nestjs/core';
import type {
  AuthContext,
  MiddlewareContext,
  MiddlewareOptions,
} from 'better-auth';

import { toNodeHandler } from 'better-auth/node';
import { createAuthMiddleware } from 'better-auth/plugins';
import { NextFunction } from 'express';
import express from 'express';
import { EmailModule } from '../../core/email/email.module';
import { AFTER_HOOK_KEY, BEFORE_HOOK_KEY, HOOK_KEY } from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [DiscoveryModule, EmailModule],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule implements NestModule, OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    @Inject(DiscoveryService)
    private discoveryService: DiscoveryService,
    @Inject(MetadataScanner)
    private metadataScanner: MetadataScanner
  ) {}

  /**
   * Initialise le service d'authentification au démarrage du module
   */
  async onModuleInit(): Promise<void> {
    console.log('AuthModule: Starting initialization...');
    // S'assurer que le service d'authentification est initialisé
    await this.authService.onModuleInit();
    console.log('AuthModule: Initialization complete');
  }

  /**
   * Configure le middleware d'authentification
   */
  async configure(consumer: MiddlewareConsumer) {
    // Attendre que l'authentification soit initialisée
    await this.onModuleInit();

    const auth = this.authService.auth;

    // Rechercher tous les hooks d'authentification dans l'application
    const providers = this.discoveryService
      .getProviders()
      .filter(
        ({ metatype }) => metatype && Reflect.getMetadata(HOOK_KEY, metatype)
      );

    // Ajouter les hooks configurés aux instances de controllers
    for (const provider of providers) {
      const providerPrototype = Object.getPrototypeOf(provider.instance);
      const methods = this.metadataScanner.getAllMethodNames(providerPrototype);

      for (const method of methods) {
        const providerMethod = providerPrototype[method];

        this.setupHook(BEFORE_HOOK_KEY, 'before', providerMethod);
        this.setupHook(AFTER_HOOK_KEY, 'after', providerMethod);
      }
    }

    // Convertir le middleware better-auth en middleware NestJS
    const handler = toNodeHandler(auth);
    console.log('AuthModule: Handler created from better-auth instance');

    // Appliquer le middleware aux routes commençant par /auth
    consumer.apply(handler).forRoutes({
      path: '/auth/*',
      method: RequestMethod.ALL,
    });

    console.log('AuthModule: Middleware applied to /auth/*');
    console.log('AuthModule: Better-Auth configuration:', {
      trustedOrigins: auth.options?.trustedOrigins || 'None',
      hasDatabase: !!auth.options?.database,
    });
  }

  /**
   * Configure un hook d'authentification
   */
  private setupHook(
    metadataKey: symbol,
    hookType: 'before' | 'after',
    providerMethod: (
      ctx: MiddlewareContext<
        MiddlewareOptions,
        AuthContext & {
          returned?: unknown;
          responseHeaders?: Headers;
        }
      >
    ) => Promise<void>
  ) {
    const auth = this.authService.auth;
    const hookPath = Reflect.getMetadata(metadataKey, providerMethod);
    if (!hookPath || !auth?.options.hooks) return;

    // @ts-ignore
    const originalHook = auth.options.hooks[hookType];
    // @ts-ignore
    auth.options.hooks[hookType] = createAuthMiddleware(async (ctx) => {
      if (originalHook) {
        await originalHook(ctx);
      }

      if (hookPath === ctx.path) {
        await providerMethod(ctx);
      }
    });
  }

  /**
   * Méthode statique permettant d'importer le module de façon asynchrone
   */
  static forRootAsync() {
    return {
      module: AuthModule,
      imports: [],
      providers: [
        AuthService,
        {
          provide: 'AUTH_OPTIONS',
          useClass: AuthService,
        },
      ],
      exports: [AuthService, 'AUTH_OPTIONS'],
    };
  }
}
