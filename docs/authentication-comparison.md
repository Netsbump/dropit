# Authentification JWT vs Session : Guide pour développeurs juniors

## Table des matières

1. [Introduction](#introduction)
2. [Sessions traditionnelles](#sessions-traditionnelles)
3. [JSON Web Tokens (JWT)](#json-web-tokens-jwt)
4. [Comparaison JWT vs Sessions](#comparaison-jwt-vs-sessions)
5. [Approche hybride dans Dropit](#approche-hybride-dans-dropit)
6. [Pourquoi ce choix pour notre architecture](#pourquoi-ce-choix-pour-notre-architecture)
7. [Schémas d'implémentation](#schémas-dimplémentation)
8. [Conclusion](#conclusion)

## Introduction

L'authentification est un élément fondamental de toute application web moderne. Elle permet de vérifier l'identité des utilisateurs et de contrôler leur accès aux ressources protégées. Deux méthodes d'authentification prédominent aujourd'hui : l'authentification par session et l'authentification par token JWT. Dans Dropit, nous utilisons une approche hybride qui combine les avantages des deux méthodes.

## Sessions traditionnelles

### Principe de fonctionnement

1. **Connexion** : L'utilisateur saisit ses identifiants (email/mot de passe)
2. **Vérification** : Le serveur vérifie ces identifiants
3. **Création de session** : Le serveur crée une session avec un identifiant unique
4. **Stockage côté serveur** : Les informations de session sont stockées en base de données ou en mémoire
5. **Cookie** : Un cookie contenant l'ID de session est envoyé au client
6. **Requêtes suivantes** : Le client envoie automatiquement ce cookie avec chaque requête
7. **Validation** : Le serveur vérifie l'ID de session à chaque requête

### Structure technique

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Client │                 │ Serveur │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │      1. Identifiants      │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │    2. Vérification        │
     │                           │─────────────────────────>│
     │                           │                           │
     │                           │     3. OK/NOK             │
     │                           │<─────────────────────────│
     │                           │                           │
     │                           │   4. Crée Session         │
     │                           │─────────────────────────>│
     │                           │                           │
     │   5. Retourne Cookie      │                           │
     │<─────────────────────────│                           │
     │                           │                           │
     │  6. Requête + Cookie      │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │  7. Vérifie Session       │
     │                           │─────────────────────────>│
     │                           │                           │
```

### Avantages

- **Révocation facile** : Il suffit de supprimer la session côté serveur
- **Contrôle serveur** : Le serveur garde le contrôle total sur les sessions
- **Simplicité** : Mécanisme simple à comprendre et à implémenter
- **Sécurité** : Les données sensibles restent côté serveur

### Inconvénients

- **Scalabilité** : Difficulté à scaler horizontalement (sessions partagées entre serveurs)
- **Stockage** : Nécessite du stockage côté serveur
- **Performance** : Requiert une recherche en base à chaque requête
- **CORS** : Problèmes potentiels avec les requêtes cross-origin (cookies)
- **Compatibilité mobile** : Moins adapté aux applications mobiles natives

## JSON Web Tokens (JWT)

### Principe de fonctionnement

1. **Connexion** : L'utilisateur fournit ses identifiants
2. **Vérification** : Le serveur vérifie ces identifiants
3. **Génération JWT** : Le serveur crée un token signé contenant les informations utilisateur
4. **Retour du token** : Le token est envoyé au client
5. **Stockage client** : Le client stocke le token (localStorage, sessionStorage, etc.)
6. **Requêtes suivantes** : Le client envoie le token dans l'en-tête Authorization
7. **Validation** : Le serveur vérifie la signature du token sans accéder à la base de données

### Structure d'un JWT

Un JWT se compose de trois parties séparées par des points :
```
xxxxx.yyyyy.zzzzz
```

- **Header** (xxxxx) : Type de token et algorithme de signature
- **Payload** (yyyyy) : Données (claims) comme l'identifiant utilisateur, rôles, etc.
- **Signature** (zzzzz) : Signature créée avec une clé secrète

### Structure technique

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Client │                 │ Serveur │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │      1. Identifiants      │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │    2. Vérification        │
     │                           │─────────────────────────>│
     │                           │                           │
     │                           │     3. OK/NOK             │
     │                           │<─────────────────────────│
     │                           │                           │
     │   4. Génère & retourne    │                           │
     │       token JWT           │                           │
     │<─────────────────────────│                           │
     │                           │                           │
     │ 5. Requête + Bearer Token │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │  6. Vérifie signature     │
     │                           │      (stateless)          │
     │                           │                           │
```

### Avantages

- **Stateless** : Pas besoin de stocker les sessions côté serveur
- **Scalabilité** : Facilite la mise à l'échelle horizontale
- **Performance** : Validation rapide sans accès base de données
- **Cross-domain** : Fonctionne bien dans les environnements CORS
- **Mobile-friendly** : Adapté aux applications mobiles natives

### Inconvénients

- **Révocation difficile** : Un token émis reste valide jusqu'à expiration
- **Taille** : Les tokens peuvent être volumineux
- **Sécurité** : Les données sont stockées côté client (même si encodées)
- **Complexité** : Gestion des expirations et rafraîchissements

## Comparaison JWT vs Sessions

| Critère | Sessions | JWT |
|---------|----------|-----|
| **Stockage** | Serveur | Client |
| **Stateful/Stateless** | Stateful | Stateless |
| **Scalabilité** | Limitée sans infrastructure supplémentaire | Excellente |
| **Révocation** | Facile | Difficile sans système supplémentaire |
| **Taille** | Légère (juste l'ID) | Plus lourde (contient les données) |
| **Performance** | Accès BD nécessaire | Validation sans BD |
| **Compatibilité mobile** | Limitée | Excellente |
| **Sécurité des données** | Meilleure (données côté serveur) | À surveiller (données côté client) |

## Approche hybride dans Dropit

Dans Dropit, nous utilisons Better-Auth qui implémente une approche hybride combinant :

1. **JWT pour l'authentification** : Les utilisateurs s'authentifient et reçoivent un JWT
2. **Suivi des sessions serveur** : Les tokens émis sont enregistrés dans une table `AuthSession`

### Comment cela fonctionne

1. L'utilisateur se connecte et reçoit un JWT
2. Ce JWT est enregistré dans la table `AuthSession` avec des métadonnées (appareil, IP, etc.)
3. Lors des requêtes, le JWT est validé cryptographiquement (comme un JWT standard)
4. Si nécessaire, la validité du token peut être vérifiée contre la table `AuthSession`

### Structure dans Dropit

```typescript
// Exemple simplifié de AuthSession dans auth.entity.ts
export class AuthSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  token: string;

  @Column()
  userAgent: string;

  @Column()
  ipAddress: string;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

## Pourquoi ce choix pour notre architecture

Dropit comprend deux interfaces principales:
- Un backoffice web pour les administrateurs et coachs
- Une application mobile pour les athlètes

Cette architecture hybride est parfaitement adaptée à nos besoins pour plusieurs raisons:

### Avantages de l'approche hybride pour Dropit

1. **Flexibilité multi-plateforme** : Fonctionne aussi bien pour le web que pour le mobile
2. **Gestion de session avancée** :
   - Possibilité de voir les appareils connectés
   - Déconnexion d'un appareil spécifique
   - Déconnexion de tous les appareils
3. **Sécurité renforcée** : Révocation possible des tokens compromis
4. **Analytics** : Suivi des connexions et habitudes d'utilisation
5. **Scalabilité** : Maintient les avantages de scalabilité des JWT
6. **Performance** : Validation principale sans accès BD, avec option de vérification approfondie

### Implémentation dans notre code

Better-Auth expose l'API d'authentification et le `AuthGuard` permet de protéger facilement les routes:

```typescript
// Protection d'un contrôleur entier
@Controller('athlete')
@UseGuards(AuthGuard)
export class AthleteController {
  // Toutes les routes nécessitent une authentification
}

// Protection d'une route spécifique
@Controller('public')
export class PublicController {
  @Get('protected')
  @UseGuards(AuthGuard)
  getProtectedData() {
    // Cette route nécessite une authentification
  }
}
```

## Schémas d'implémentation

### Flux d'authentification et validation

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Client │                 │ Serveur │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │      1. Identifiants      │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │    2. Vérification        │
     │                           │─────────────────────────>│
     │                           │                           │
     │                           │     3. OK/NOK             │
     │                           │<─────────────────────────│
     │                           │                           │
     │                           │  4. Crée AuthSession      │
     │                           │─────────────────────────>│
     │                           │                           │
     │   5. Retourne JWT Token   │                           │
     │<─────────────────────────│                           │
     │                           │                           │
     │  6. Requête + JWT Token   │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │ 7. Vérifie signature JWT  │
     │                           │    (validité cryptographique)  
     │                           │                           │
     │                           │ 8. [Optionnel] Vérifie si │
     │                           │    token est dans AuthSession
     │                           │─────────────────────────>│
     │                           │                           │
```

### Déconnexion et révocation

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Client │                 │ Serveur │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │     1. Déconnexion        │                           │
     │   (avec token actuel)     │                           │
     │─────────────────────────>│                           │
     │                           │                           │
     │                           │ 2. Marque AuthSession     │
     │                           │    comme inactive         │
     │                           │─────────────────────────>│
     │                           │                           │
     │   3. Confirmation         │                           │
     │<─────────────────────────│                           │
     │                           │                           │
     │ 4. Supprime token local   │                           │
     │                           │                           │
```

## Conclusion

L'approche hybride JWT+Sessions implémentée dans Dropit avec Better-Auth représente un excellent compromis qui permet de bénéficier des avantages des deux systèmes d'authentification :

- **La scalabilité et les performances des JWT**
- **Le contrôle et la sécurité des sessions traditionnelles**

Cette solution est particulièrement adaptée à notre architecture multi-plateforme (backoffice web + application mobile) et offre une flexibilité maximale pour gérer l'authentification de manière sécurisée et performante.

Pour les développeurs juniors qui découvrent ces concepts, retenez que le choix d'une méthode d'authentification doit toujours être guidé par les besoins spécifiques de votre application, en prenant en compte des facteurs comme la scalabilité, la sécurité, et l'expérience utilisateur. 