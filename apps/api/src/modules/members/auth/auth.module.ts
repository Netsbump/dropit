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
    console.log('AuthModule: Configuring middleware...');
    // Attendre que l'authentification soit initialisée
    await this.onModuleInit();

    const auth = this.authService.auth;
    console.log('AuthModule: Auth service initialized');
    console.log('AuthModule: Auth instance type:', typeof auth);
    console.log('AuthModule: Auth instance methods:', Object.keys(auth));
    console.log(
      'AuthModule: Auth instance API methods:',
      Object.keys(auth.api)
    );
    console.log('AuthModule: Auth instance handler type:', typeof auth.handler);
    console.log(
      'AuthModule: Auth instance handler methods:',
      Object.keys(auth.handler)
    );
    console.log('AuthModule: Auth options:', auth.options);

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
    console.log('AuthModule: BetterAuth middleware mounted!');

    // Wrapper le handler pour ajouter des logs
    const loggedHandler = (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.log('=== BETTER AUTH MIDDLEWARE START ===');
      console.log('Route:', req.originalUrl);
      console.log('Method:', req.method);
      console.log('Body:', req.body);
      console.log('Handler type:', typeof handler);
      console.log('Auth options:', auth.options);
      console.log('Available API methods:', Object.keys(auth.api));
      console.log('Handler implementation:', handler.toString());

      // Log the request before passing it to better-auth
      console.log('=== BETTER AUTH REQUEST DETAILS ===');
      console.log('URL:', req.url);
      console.log('Original URL:', req.originalUrl);
      console.log('Path:', req.path);
      console.log('Base URL:', req.baseUrl);
      console.log('Headers:', req.headers);

      handler(req, res);
      console.log('=== BETTER AUTH MIDDLEWARE COMPLETE ===');
    };

    // Appliquer le middleware aux routes commençant par /auth
    consumer.apply(handler).forRoutes({
      path: '/auth/*',
      method: RequestMethod.ALL,
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
