import { Injectable, OnModuleInit } from '@nestjs/common';
import { Auth, betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { config } from '../../../config/env.config';
import { EmailService } from '../../core/email/email.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private _auth: Auth | null = null;
  private static initPromise: Promise<void> | null = null;

  constructor(private emailService: EmailService) {}

  /**
   * Initialisation du module auth lors du démarrage de l'application
   */
  async onModuleInit() {
    console.log('AuthService: Starting initialization...');
    console.log('AuthService: initPromise state:', {
      isNull: AuthService.initPromise === null,
      isPending: AuthService.initPromise instanceof Promise,
      hasValue: !!AuthService.initPromise,
    });

    if (!AuthService.initPromise) {
      console.log('AuthService: Creating new initPromise');
      AuthService.initPromise = this.initialize().then(() => {
        console.log('AuthService: initPromise resolved');
        return;
      });
    } else {
      console.log('AuthService: Using existing initPromise');
    }

    await AuthService.initPromise;
    console.log('AuthService: Initialization complete');
  }

  /**
   * Initialise l'instance better-auth
   */
  private async initialize() {
    console.log('AuthService: initialize() called');
    if (this._auth) {
      console.log('AuthService: Auth already initialized');
      return;
    }

    console.log('AuthService: Creating auth configuration...');
    // Créer la configuration avec les implémentations d'email
    this._auth = betterAuth({
      trustedOrigins: config.betterAuth.trustedOrigins,
      emailAndPassword: {
        enabled: true,
        sendResetPassword: async (data) => {
          return this.emailService.sendEmail({
            to: data.user.email,
            subject: 'Reset your password',
            content: `Hello ${data.user.name}, please reset your password by clicking on the link below: ${data.url}`,
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 60 * 24 * 10, // 10 days
        sendVerificationEmail: async (data) => {
          return this.emailService.sendEmail({
            to: data.user.email,
            subject: 'Verify your email',
            content: `Hello ${data.user.name}, please verify your email by clicking on the link below: ${data.url}`,
          });
        },
      },
      database: new Pool({
        connectionString: config.database.connectionStringUrl,
      }),
      advanced: {
        generateId: false,
      },
      rateLimit: {
        window: 50,
        max: 100,
      },
    }) as unknown as Auth;
    console.log('AuthService: Auth configuration created');
    console.log('AuthService: initialize() resolving...');
    return Promise.resolve();
  }

  /**
   * Récupère l'instance better-auth
   */
  get auth() {
    if (!this._auth) {
      console.error(
        'AuthService: Auth not initialized - call onModuleInit first'
      );
      throw new Error('Auth not initialized - call onModuleInit first');
    }
    console.log('AuthService: Getting auth instance');
    console.log('AuthService: Auth instance type:', typeof this._auth);
    console.log('AuthService: Auth instance methods:', Object.keys(this._auth));
    return this._auth;
  }

  /**
   * Récupère l'API better-auth
   */
  get api() {
    console.log('AuthService: Accessing auth API');
    console.log('AuthService: Configuration:', {
      secret: config.betterAuth.secret ? 'Set' : 'Not set',
      trustedOrigins: config.betterAuth.trustedOrigins,
    });
    console.log('AuthService: API methods:', Object.keys(this.auth.api));
    return this.auth.api;
  }
}
