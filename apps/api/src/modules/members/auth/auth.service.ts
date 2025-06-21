import { Injectable, OnModuleInit } from '@nestjs/common';
import { Auth } from 'better-auth';
import { createAuthConfig } from '../../../config/better-auth.config';
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
    if (!AuthService.initPromise) {
      AuthService.initPromise = this.initialize().then(() => {
        return;
      });
    }

    await AuthService.initPromise;
  }

  /**
   * Initialise l'instance better-auth
   */
  private async initialize() {
    if (this._auth) {
      return;
    }

    // Utilise la configuration centralisée et injecte les dépendances (email)
    this._auth = createAuthConfig({
      sendResetPassword: async (data) => {
        return this.emailService.sendEmail({
          to: data.user.email,
          subject: 'Reset your password',
          content: `Hello ${data.user.name}, please reset your password by clicking on the link below: ${data.url}`,
        });
      },
      sendVerificationEmail: async (data) => {
        return this.emailService.sendEmail({
          to: data.user.email,
          subject: 'Verify your email',
          content: `Hello ${data.user.name}, please verify your email by clicking on the link below: ${data.url}`,
        });
      },
    }) as unknown as Auth;
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
    return this._auth;
  }

  /**
   * Récupère l'API better-auth
   */
  get api() {
    return this.auth.api;
  }
}
