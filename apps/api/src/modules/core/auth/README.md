# Module Auth Core

Ce module configure et initialise better-auth pour l'application.

## Architecture

```
@/core/auth/
├── auth.module.ts    # Configuration better-auth (middleware, hooks, discovery)
├── auth.service.ts   # Service wrapper better-auth
└── README.md         # Documentation
```

## Processus d'initialisation

### 1. Démarrage de l'application

```typescript
// app.module.ts
@Module({
  imports: [
    IdentityModule, // Importe AuthModule via IdentityModule
    // ...
  ],
})
export class AppModule {}
```

### 2. Initialisation du module core/auth

```typescript
// @/core/auth/auth.module.ts
@Global()
@Module({
  imports: [DiscoveryModule, EmailModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule, OnModuleInit {
  // ...
}
```

**Ordre d'exécution :**

1. **`onModuleInit()`** : Initialise AuthService
2. **`configure()`** : Configure le middleware et les hooks

### 3. Initialisation d'AuthService

```typescript
// @/core/auth/auth.service.ts
@Injectable()
export class AuthService implements OnModuleInit {
  async onModuleInit() {
    // Singleton pattern pour éviter les initialisations multiples
    if (!AuthService.initPromise) {
      AuthService.initPromise = this.initialize();
    }
    await AuthService.initPromise;
  }

  private async initialize() {
    // Crée l'instance better-auth avec la configuration
    this._auth = createAuthConfig({
      sendResetPassword: async (data) => {
        return this.emailService.sendEmail({...});
      },
      sendVerificationEmail: async (data) => {
        return this.emailService.sendEmail({...});
      },
    }, this.em);
  }
}
```

**Configuration better-auth :**
- **Secret** : Clé de chiffrement des sessions
- **Cookies** : Configuration HttpOnly, secure, sameSite
- **Bearer token** : Support pour mobile
- **Email** : Hooks pour reset password et verification
- **Database** : Pool PostgreSQL
- **Rate limiting** : Protection contre les attaques
- **Organization plugin** : Support multi-organisations

### 4. Configuration du middleware

```typescript
// @/core/auth/auth.module.ts
async configure(consumer: MiddlewareConsumer) {
  // 1. Attendre l'initialisation
  await this.onModuleInit();

  // 2. Discovery des hooks d'authentification
  const providers = this.discoveryService
    .getProviders()
    .filter(({ metatype }) => metatype && Reflect.getMetadata(HOOK_KEY, metatype));

  // 3. Configuration des hooks before/after
  for (const provider of providers) {
    // Configure les hooks @BeforeHook et @AfterHook
    this.setupHook(BEFORE_HOOK_KEY, 'before', providerMethod);
    this.setupHook(AFTER_HOOK_KEY, 'after', providerMethod);
  }

  // 4. Configuration du middleware NestJS
  const handler = toNodeHandler(auth);
  consumer.apply(handler).forRoutes({
    path: '/auth/*',
    method: RequestMethod.ALL,
  });
}
```

## Routes better-auth configurées

Le middleware s'applique sur toutes les routes `/auth/*` :

| Route | Méthode | Description |
|-------|---------|-------------|
| `/auth/signup` | POST | Inscription utilisateur |
| `/auth/login` | POST | Connexion utilisateur |
| `/auth/logout` | POST | Déconnexion utilisateur |
| `/auth/me` | GET | Informations utilisateur connecté |
| `/auth/refresh` | POST | Rafraîchissement token |
| `/auth/verify` | GET | Vérification email |
| `/auth/reset-password` | POST | Demande reset password |

## Hooks d'authentification

### Décorateurs disponibles

```typescript
// @/identity/infrastructure/decorators/auth.decorator.ts
@BeforeHook('/auth/login')  // Exécuté avant login
@AfterHook('/auth/signup')  // Exécuté après signup
@Hook()                     // Marque une classe comme hook
```

### Exemple d'utilisation

```typescript
@Hook()
export class AuthHooks {
  @BeforeHook('/auth/login')
  async beforeLogin(ctx: MiddlewareContext) {
    console.log('Before login:', ctx.path);
  }

  @AfterHook('/auth/signup')
  async afterSignup(ctx: MiddlewareContext) {
    console.log('After signup:', ctx.path);
  }
}
```

## Utilisation dans les autres modules

### Import du module

```typescript
// @/identity/identity.module.ts
@Module({
  imports: [AuthModule], // Importe la configuration better-auth
  // ...
})
export class IdentityModule {}
```

### Utilisation du service

```typescript
// Dans un guard ou service
@Injectable()
export class AuthGuard {
  constructor(private authService: AuthService) {}

  async canActivate() {
    const session = await this.authService.api.getSession({...});
    // ...
  }
}
```

## Tables d'identité

Les tables d'identité restent dans `@/identity` car elles correspondent à l'implémentation better-auth :

- **User** : Utilisateurs better-auth
- **Session** : Sessions better-auth  
- **Organization** : Organisations métier
- **Member** : Membres d'organisation
- **Invitation** : Invitations d'organisation

## Dépendances

- **EmailModule** : Envoi des emails de reset/verification
- **EntityManager** : Accès aux entités MikroORM
- **DiscoveryModule** : Discovery des hooks d'authentification
- **MetadataScanner** : Analyse des métadonnées des hooks 