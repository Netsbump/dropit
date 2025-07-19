# Flux d'Invitation d'Athlète

Ce document décrit le flux complet d'invitation d'un athlète, depuis le clic utilisateur jusqu'à l'envoi de l'email.

## Diagramme de Séquence

```mermaid
sequenceDiagram
    participant U as Utilisateur (Coach)
    participant F as Frontend React
    participant BA as Better Auth Client
    participant API as API NestJS
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

## Composants Impliqués

### Frontend
- **Formulaire** : `AthleteInvitationForm` (React + react-hook-form)
- **Client** : `authClient.organization.inviteMember()`
- **UI** : Modal, toast, validation

### Backend
- **Route** : `POST /auth/organization/invite-member` (Better Auth)
- **Guards** : `AuthGuard` + `PermissionsGuard`
- **Service** : `EmailService` avec Brevo
- **Base** : Table `invitation` (Better Auth)

### Configuration
- **Better Auth** : Plugin `organization` avec hook `sendInvitationEmail`
- **Email** : Template HTML + configuration Brevo
- **Permissions** : `create` sur ressource `invitation`

## Points Clés

1. **Sécurité** : Double vérification (auth + permissions)
2. **Automatisation** : Better Auth gère tout le processus
3. **Email** : Template HTML professionnel via Brevo
4. **Lien** : `http://localhost:5173/accept-invitation/{id}`
5. **Expiration** : 7 jours par défaut

## Prochaines Étapes

1. ✅ **Invitation créée** - Fonctionne
2. 🔄 **Configuration Brevo** - En cours
3. ⏳ **Route d'acceptation** - À faire
4. ⏳ **Flux complet** - À tester 