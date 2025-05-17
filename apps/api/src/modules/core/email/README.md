# Email Module

This module handles email sending in the application.

## Technologies Used

- [nodemailer](https://nodemailer.com/about/) - Email sending service

## Features

- Email sending service
- Support for transactional emails
- Email logging

## Configuration

Currently, the module is configured to log emails rather than actually sending them. This is useful for development and testing.

## Sending Interface

```typescript
interface EmailOptions {
  to: string
  subject: string
  content: string
}
```

## Intégration avec Nodemailer (pour la production)

Lorsque je serai prêt à envoyer des emails réels, je pourrai intégrer Nodemailer dans l'EmailService:

### 1. Configuration du service d'emails

Mettre à jour mon EmailService pour utiliser Nodemailer:

```typescript
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialiser le transporteur Nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: this.configService.get('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail({
    to,
    subject,
    content,
  }: {
    to: string;
    subject: string;
    content: string;
  }): Promise<void> {
    // En environnement de développement, simplement logger les emails
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log('Email sent (dev mode):', { to, subject, content });
      return;
    }

    // En production, envoyer l'email via Nodemailer
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      html: content,
    });
  }

  // Méthodes spécifiques pour les emails transactionnels
  async sendVerificationEmail(user: any, url: string, token: string): Promise<void> {
    const verificationUrl = `${url}?token=${token}`;
    
    await this.sendEmail({
      to: user.email,
      subject: 'Vérification de votre adresse email',
      content: `
        <h1>Vérification d'email</h1>
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email.</p>
        <p><a href="${verificationUrl}">Cliquez ici pour vérifier votre email</a></p>
      `,
    });
  }

  async sendResetPasswordEmail(user: any, url: string, token: string): Promise<void> {
    const resetUrl = `${url}?token=${token}`;
    
    await this.sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      content: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour,</p>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p><a href="${resetUrl}">Cliquez ici pour définir un nouveau mot de passe</a></p>
        <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>
      `,
    });
  }
}
```

### 3. Variables d'environnement nécessaires

Je dois ajouter ces variables à mon fichier `.env`:

```env
# Configuration email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=user@example.com
EMAIL_PASSWORD=password
EMAIL_FROM=noreply@example.com
```

## Intégration avec better-auth

Pour intégrer ce module avec better-auth, je dois mettre à jour mon fichier `better-auth.config.ts`:

```typescript
import { betterAuth, User } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import { config } from './env.config';

// Interface pour les options dynamiques
interface BetterAuthOptionsDynamic {
  emailService: {
    sendResetPasswordEmail: (user: User, url: string, token: string) => Promise<void>;
    sendVerificationEmail: (user: User, url: string, token: string) => Promise<void>;
  };
}

export function createAuthConfig(options: BetterAuthOptionsDynamic) {
  return betterAuth({
    secret: config.betterAuth.secret,
    trustedOrigins: config.betterAuth.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async (data, request) => {
        await options.emailService.sendResetPasswordEmail(
          data.user,
          data.url,
          data.token
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24 * 10, // 10 jours
      sendVerificationEmail: async (data, request) => {
        await options.emailService.sendVerificationEmail(
          data.user,
          data.url,
          data.token
        );
      },
    },
    database: new Pool({
      connectionString: config.database.connectionString,
    }),
    advanced: {
      generateId: false,
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    plugins: [openAPI()],
  });
}
```

Et dans mon module d'authentification, je dois injecter le service d'email:

```typescript
@Module({
  imports: [EmailModule],
  providers: [
    {
      provide: 'AUTH',
      useFactory: (emailService: EmailService) => {
        return createAuthConfig({ emailService });
      },
      inject: [EmailService],
    },
  ],
  exports: ['AUTH'],
})
export class AuthModule {}