import { Injectable, OnModuleInit } from '@nestjs/common';
import { Auth } from 'better-auth';
import { createAuthConfig } from '../../../config/better-auth.config';
import { EmailService } from '../email/email.service';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class AuthService implements OnModuleInit {
  private _auth: Auth | null = null;
  private static initPromise: Promise<void> | null = null;

  constructor(private emailService: EmailService, private em: EntityManager) {}

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
      // NOUVEAU : Configuration pour l'envoi d'email d'invitation
      sendInvitationEmail: async (data) => {
        console.log('📧 [AuthService] Sending invitation email via EmailService');
        
        return this.emailService.sendInvitationEmail({
          to: data.email,
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          organizationName: data.organization.name,
          inviteLink: data.inviteLink || '',
        });
      },
    }, this.em) as unknown as Auth;
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
