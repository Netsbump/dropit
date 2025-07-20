# Rejoindre une organisation ou ajouter des membres

Ce document regroupe toute la documentation technique relative à l'ajout d'un athlète dans son club et au fonctionnement du système d'invitations.

## User Stories

### Onboarding utilisateur

**En tant qu'utilisateur nouvellement connecté sans organisation**, je veux choisir mon rôle dans l'écosystème afin de rejoindre ou créer un club.

**Scénarios :**
- **Créer un club** : L'utilisateur devient coach et accède au dashboard web (backoffice d'administration)
- **Rejoindre un club** : L'utilisateur devient athlète et est redirigé vers l'application mobile

### Création d'organisation

**En tant que coach**, je veux créer mon club afin d'administrer mes athlètes.

**Flux :**
1. Route : `/create-organization`
2. Formulaire de création avec informations du club
3. Attribution automatique du rôle `coach`
4. Redirection vers `/dashboard` (dashboard web - backoffice d'administration du club)

### Adhésion à une organisation

**En tant qu'athlète**, je veux rejoindre un club existant afin de bénéficier du coaching.

**Flux :**
1. Route : `/join-organization`
2. Choix : sélection du club + message OU code d'invitation
3. **Desktop** : redirection vers `/download-app` (téléchargement de l'app mobile)
4. **Mobile** : notification d'attente + accès limité au dashboard mobile (visualisation des entraînements)

### Téléchargement de l'application mobile

**En tant qu'athlète**, je veux télécharger l'application mobile afin d'accéder à mon dashboard mobile et visualiser mes entraînements.

**Page :** `/download-app` avec liens vers App Store et Google Play

---

## Flux techniques

### Flux d'Invitation d'Athlète

Le flux complet d'invitation d'un athlète, depuis le clic utilisateur jusqu'à l'envoi de l'email.

### Diagramme de Séquence

```mermaid
sequenceDiagram
    participant U as Utilisateur (Coach)
    participant F as Frontend
    participant BA as Better Auth Client
    participant API as API
    participant GA as AuthGuard
    participant PG as PermissionsGuard
    participant BA_S as Better Auth Server
    participant DB as Base de Données
    participant ES as EmailService
    participant B as Brevo

    U->>F: Clic "Inviter un athlète"
    F->>F: Ouvre modal avec formulaire
    U->>F: Saisit email + clique "Envoyer"
    
    F->>BA: authClient.organization.inviteMember({email, role: 'member'})
    BA->>API: POST /auth/organization/invite-member
    
    API->>GA: AuthGuard.canActivate()
    GA->>DB: Vérifie session utilisateur
    DB-->>GA: Session valide
    GA-->>API: ✅ Authentifié
    
    API->>PG: PermissionsGuard.canActivate()
    PG->>DB: Vérifie permissions (create)
    DB-->>PG: Permissions OK
    PG-->>API: ✅ Autorisé
    
    API->>BA_S: Middleware redirige vers Better Auth
    BA_S->>DB: INSERT INTO invitation (id, email, inviterId, organizationId, role, status, expiresAt, createdAt)
    DB-->>BA_S: Invitation créée
    
    BA_S->>BA_S: Hook sendInvitationEmail()
    BA_S->>ES: emailService.sendInvitationEmail()
    ES->>B: Envoi email via Brevo
    B-->>ES: Email envoyé
    ES-->>BA_S: ✅ Email traité
    
    BA_S-->>API: Response avec invitationId
    API-->>BA: Response transmise
    BA-->>F: Success response
    F->>F: Toast "Invitation envoyée !"
    F-->>U: Modal fermé
```

### Composants Impliqués

#### Frontend
- **Formulaire** : `AthleteInvitationForm` (React + react-hook-form)
- **Client** : `authClient.organization.inviteMember()`
- **UI** : Modal, toast, validation

#### Backend
- **Route** : `POST /auth/organization/invite-member` (Better Auth)
- **Guards** : `AuthGuard` + `PermissionsGuard`
- **Service** : `EmailService` avec Brevo
- **Base** : Table `invitation` (Better Auth)

#### Configuration
- **Better Auth** : Plugin `organization` avec hook `sendInvitationEmail`
- **Email** : Template HTML + configuration Brevo
- **Permissions** : `create` sur ressource `invitation`

### Points Clés

1. **Sécurité** : Double vérification (auth + permissions)
2. **Automatisation** : Better Auth gère tout le processus
3. **Email** : Template HTML professionnel via Brevo
4. **Lien** : `http://localhost:5173/accept-invitation/{id}`
5. **Expiration** : 7 jours par défaut

---

## Flux d'Acceptation d'Invitation

Ce diagramme décrit le flux complet d'acceptation d'une invitation, depuis la réception de l'email jusqu'à l'intégration dans l'organisation.

```mermaid
sequenceDiagram
    participant U as Utilisateur (Athlète)
    participant F as Frontend React
    participant BA as Better Auth Client
    participant API as API NestJS
    participant BA_S as Better Auth Server
    participant DB as Base de Données

    U->>F: Clic sur lien d'invitation dans email
    F->>F: Charge page /accept-invitation/:id
    
    Note over F: Aucune requête d'invitation avant authentification
    
    Note over F: Utilisateur choisit "J'ai un compte" ou "Créer un compte"
    
    alt Connexion (J'ai un compte)
        U->>F: Saisit email + mot de passe
        F->>BA: authClient.signIn.email({email, password})
        BA->>API: POST /auth/login
        API->>BA_S: Middleware redirige vers Better Auth
        BA_S->>DB: Vérifie credentials + crée session
        DB-->>BA_S: Session créée
        BA_S-->>API: Response avec session
        API-->>BA: Response transmise
        BA-->>F: ✅ Connexion réussie
    else Inscription (Créer un compte)
        U->>F: Saisit nom + email + mot de passe
        F->>BA: authClient.signUp.email({name, email, password})
        BA->>API: POST /auth/signup
        API->>BA_S: Middleware redirige vers Better Auth
        BA_S->>DB: Crée utilisateur + session
        DB-->>BA_S: Utilisateur et session créés
        BA_S-->>API: Response avec session
        API-->>BA: Response transmise
        BA-->>F: ✅ Inscription réussie
    end
    
    F->>F: handleAuthSuccess() déclenché
    F->>F: setIsCheckingInvitation(true)
    F->>F: Affichage "Vérification de l'invitation..."
    
    F->>BA: authClient.organization.getInvitation({id})
    BA->>API: GET /auth/organization/get-invitation
    
    API->>BA_S: Middleware redirige vers Better Auth
    BA_S->>DB: SELECT invitation WHERE id = :id
    DB-->>BA_S: Détails invitation (org, inviter, status)
    BA_S-->>API: Response avec données invitation
    API-->>BA: Response transmise
    BA-->>F: ✅ Invitation récupérée
    
    F->>BA: authClient.organization.acceptInvitation({invitationId})
    BA->>API: POST /auth/organization/accept-invitation
    
    API->>BA_S: Middleware redirige vers Better Auth
    BA_S->>DB: UPDATE invitation SET status = 'accepted'
    BA_S->>DB: INSERT INTO member (userId, organizationId, role)
    DB-->>BA_S: Invitation acceptée + membre créé (role: 'member')
    BA_S-->>API: Response avec succès
    API-->>BA: Response transmise
    BA-->>F: ✅ Invitation acceptée
    
    F->>F: Vérification du rôle utilisateur
    F->>BA: authClient.getSession()
    BA-->>F: Session avec role: 'member'
    
    F->>F: Redirection vers /download-app (athlètes)
    F-->>U: Page de téléchargement de l'app mobile
    
    Note over F: Si erreur lors de la récupération d'invitation
    F->>F: setInvitationError(error)
    F->>F: Affichage "Invitation invalide - Recontacter votre coach"
```

### Composants Impliqués

#### Frontend
- **Page** : `AcceptInvitationPage` avec tabs login/signup
- **Composants** : `LoginForm` et `SignupForm` réutilisables
- **État local** : `isCheckingInvitation` et `invitationError` pour gérer les états
- **Client** : `authClient.organization.getInvitation()` et `acceptInvitation()`
- **Navigation** : Redirection intelligente selon le rôle :
  - Athlètes (`member`) → `/download-app`
  - Coaches (`admin`/`owner`) → `/dashboard`

#### Backend
- **Routes** : 
  - `GET /auth/organization/get-invitation` (Better Auth)
  - `POST /auth/organization/accept-invitation` (Better Auth)
  - `POST /auth/login` et `POST /auth/signup` (Better Auth)
- **Base** : Tables `invitation` et `member` (Better Auth)

#### Configuration
- **Better Auth** : Plugin `organization` avec gestion automatique
- **Permissions** : Vérification automatique des rôles
- **Session** : Gestion automatique après authentification

