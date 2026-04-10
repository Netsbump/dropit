# Système de Notifications et Authentification OTP

## Vue d'ensemble

DropIt utilise un système de notifications centralisé qui gère l'envoi d'emails, SMS et push notifications. Ce système est couplé à l'authentification par OTP (One-Time Password)
et par mot de passe pour l'accès des super admin. Le tout via better-auth.

### Objectifs

- **Centralisation** : Un seul module pour toutes les notifications
- **Multi-canal** : Email (prod/dev), Push notifications (Mobile App), SMS (Phase 3 MVP)
- **OTP-based auth** : Remplacement de l'authentification par mot de passe sauf pour super admins
- **Plugin admin Better-Auth** : Remplacement du champ `isSuperAdmin` custom par le plugin `admin` (impersonate, admin-only routes, permissions)
- **Password + 2FA pour admins** : Super admins gardent password auth + OTP 2FA pour sécurité maximale
- **Clean Architecture** : Ports & Adapters pour l'indépendance des providers

---

## Architecture Actuelle

### Module Notification 

```
notification/
├── domain/
│   └── notification-transport.ts          # Types: NotificationTransport, EmailTemplate
│
├── application/
│   ├── ports/
│   │   ├── in/
│   │   │   └── notification-use-cases.port.ts    # INotificationUseCases (Port IN)
│   │   └── out/
│   │       ├── notification.port.ts              # INotificationPort (Port OUT)
│   │       ├── email.port.ts                     # IEmailPort
│   │       ├── sms.port.ts                       # ISmsPort
│   │       └── push.port.ts                      # IPushPort
│   ├── use-cases/
│   │   └── notification.use-cases.ts             # Logique métier notifications
│   └── exceptions/
│       └── notification.exceptions.ts
│
├── infrastructure/
│   ├── notification.adapter.ts                   # Route vers email/SMS/push
│   ├── email/
│   │   ├── brevo.adapter.ts                      # Production (Brevo API)
│   │   └── maildev.adapter.ts                    # Development (SMTP local)
│   ├── sms/
│   │   └── twilio.adapter.ts                     # SMS via Twilio
│   └── push/
│       └── fcm.adapter.ts                        # Push via Firebase
│
└── notification.module.ts
└── README.md              # Schéma simple + lien vers cette doc
```

**README.md dans le module** :
```markdown
# Module Notification

Système centralisé de notifications multi-canal.

## Architecture

```
Use Case (métier)
    ↓
INotificationUseCases (Port IN)
    ↓
NotificationUseCase
    ↓
INotificationPort (Port OUT)
    ↓
NotificationAdapter
    ↓
Email/SMS/Push Adapters
```

📖 **Documentation complète** : `docs/architectures/notification-otp-system.md`
```

### Flow d'authentification OTP

#### Coach (Web App - Back Office)

```
Coach → Web App (https://app.dropit.com)
    ↓ Entre email
Better-auth (emailOTP plugin)
    ↓ Génère OTP, appelle callback
auth.service.ts → NotificationUseCase.sendOtpEmail()
    ↓
Email OTP envoyé (Brevo/Maildev)
    ↓
Coach entre code → Session créée
    ↓
Dashboard back office
```

#### Athlete (Mobile App)

```
Athlete → Mobile App (iOS/Android)
    ↓ Entre phone (ou email)
Better-auth (phoneNumber ou emailOTP plugin)
    ↓ Génère OTP, appelle callback
auth.service.ts → NotificationUseCase.sendOtpSms() ou sendOtpEmail()
    ↓
SMS OTP (Twilio - Phase 3) OU Email OTP (Phase 1-2)
    ↓
Athlete entre code → Session créée
    ↓
App mobile athlete
```

#### Super Admin (Web App - Login Spécial)

```
Admin → Web App Admin (https://app.dropit.com/admin)
    ↓ Entre email + password
Better-auth (emailAndPassword + admin plugin)
    ↓ Vérifie password
Better-auth envoie OTP 2FA
    ↓
Email OTP envoyé
    ↓
Admin entre code OTP → Session créée avec permissions admin
    ↓
Dashboard admin (impersonate, gestion users, etc.)
```

---

## Use Cases Disponibles

### 1. Authentification OTP

**`sendOtpEmail(email, otp, type)`**
- **Utilisé pour** : Login web (coaches), signup, admin 2FA
- **Transport** : Email (Brevo en prod, Maildev en dev)
- **Expiration** : 5 minutes
- **Max attempts** : 3
- **Type values** : `'sign-in'`, `'email-verification'`, `'2fa'`

**`sendOtpSms(phoneNumber, otp)`**
- **Utilisé pour** : Login mobile app (athletes) - **Phase 3 MVP**
- **Transport** : SMS (Twilio ou OVH SMS)
- **Expiration** : 5 minutes
- **Format** : "Votre code DropIt: 123456. Expire dans 5 minutes."
- **Note** : En Phase 1-2, athletes utilisent Email OTP

### 2. Invitations Organisation

**`sendInvitation(organizationId, email, invitedBy, token)`**
- **Logique métier** :
  - Si user existe → Email + Push notification
  - Si user n'existe pas → Email avec deep link vers app mobile
- **Graceful degradation** : Push échoue silencieusement si pas de device token
- **Deep link** : `dropit://accept-invitation/{token}` (voir section Deep Links)

### 3. Notifications Athletes

**`sendWorkoutReminder(userId, workoutName, scheduledAt)`**
- **Transport** : Push uniquement
- **Destinataire** : Athlete
- **Logique** : Si athlete n'a pas l'app = pas de compte = pas de reminder (normal)

**`sendPrAchieved(athleteId, coachId, exerciseName, weight)`**
- **Transport** : Push au coach (web app)
- **Destinataire** : Coach de l'athlete
- **Usage** : Notifier le coach qu'un de ses athletes a réalisé un nouveau PR
- **Future feature** : Feed public des PRs pour notifier les autres athletes du club

### 4. Admin Password Reset

**`sendPasswordReset(email, resetToken)`**
- **Utilisé pour** : Reset password **super admins uniquement**
- **Transport** : Email
- **Note** : Coaches et athletes n'ont pas de password, donc pas de reset

---

## Configuration par Environnement

### Development

- **Email** : Maildev (SMTP local sur localhost:1025)
  - WebUI : http://localhost:1080
  - Pas d'email réellement envoyé
- **SMS** : Mock ou Twilio test credentials
- **Push** : Mock ou Firebase test project

### Production

- **Email** : Brevo (API)
  - Requires: `BREVO_API_KEY`, `EMAIL_FROM_EMAIL`, `EMAIL_FROM_NAME`
- **SMS** : Twilio
  - Requires: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Push** : Firebase Cloud Messaging
  - Requires: `FIREBASE_SERVICE_ACCOUNT_KEY`

---

## Ports & Adapters Pattern

### Pourquoi ?

- **Indépendance des providers** : Changer de Brevo à SendGrid sans toucher au métier
- **Testabilité** : Mock les ports pour tester les use cases
- **Multi-environnement** : Dev/Prod avec providers différents

### Port OUT: INotificationPort

```typescript
interface INotificationPort {
  sendEmail(params: IEmailParams): Promise<void>;
  sendSms(params: ISmsParams): Promise<void>;
  sendPush(params: IPushParams): Promise<void>;
}
```

**Implémenté par** : `NotificationAdapter`

### Port OUT: IEmailPort

```typescript
interface IEmailPort {
  send(params: { to, subject, template, data }): Promise<void>;
}
```

**Implémenté par** :
- `BrevoAdapter` (production)
- `MaildevAdapter` (development)

### Port IN: INotificationUseCases

```typescript
interface INotificationUseCases {
  sendInvitation(...): Promise<void>;
  sendOtpEmail(...): Promise<void>;
  sendOtpSms(...): Promise<void>;
  sendWorkoutReminder(...): Promise<void>;
  // ...
}
```

**Implémenté par** : `NotificationUseCase`

**Utilisé par** : Controllers, autres use cases, better-auth callbacks

---

## Better-Auth Integration

### Plugins Utilisés

**`emailOTP`**
- Génère et stocke OTP dans DB (hashed)
- Expiration : 5 minutes
- Max attempts : 3
- Callback : `sendVerificationOTP({ email, otp, type })`

**`phoneNumber`**
- Gère OTP par SMS
- Callback : `sendOTP({ phoneNumber, otp })`

### Configuration

```typescript
// better-auth.config.ts
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    await notificationUseCase.sendOtpEmail({ email, otp, type });
  },
  otpLength: 6,
  expiresIn: 300,
  storeOTP: "hashed",
}),

phoneNumber({
  async sendOTP({ phoneNumber, otp }) {
    await notificationUseCase.sendOtpSms({ phoneNumber, otp });
  },
  otpLength: 6,
  expiresIn: 300,
}),
```

### Callbacks vers NotificationModule

**auth.service.ts** injecte `NotificationUseCase` et wired les callbacks :

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject(NOTIFICATION_USE_CASES)
    private notificationUseCase: INotificationUseCases
  ) {}

  // Callbacks better-auth → notification use cases
}
```

### Plugin Admin Better-Auth

**Remplacement de `isSuperAdmin` custom**

Le plugin `admin` de better-auth apporte des fonctionnalités avancées pour les super admins.

#### Configuration

```typescript
// better-auth.config.ts
import { admin } from "better-auth/plugins";

admin({
  impersonationSessionDuration: 60 * 60, // 1 heure
  requireEmailVerification: true,
})
```

#### Fonctionnalités

✅ **Impersonate** : Se connecter en tant qu'un autre user
```typescript
// Frontend admin dashboard
await authClient.admin.impersonateUser({ userId: 'user_123' });
// → Session temporaire créée en tant que user_123
```

✅ **Admin-only routes** : Protection automatique
```typescript
// Backend
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  // Routes accessibles uniquement par admins
}
```

✅ **Permission checks** : Client-side et server-side
```typescript
// Frontend
const { data: session } = useSession();
const isAdmin = session?.user?.role === 'admin';

if (!isAdmin) {
  return <Navigate to="/" />;
}
```

#### Migration de `isSuperAdmin` → Plugin Admin

**Avant** :
```typescript
@Property()
isSuperAdmin = false; // Champ custom
```

**Après** :
```typescript
// Supprimer le champ custom
// Better-auth gère les roles via le plugin admin
```

**Assigner role admin** :
```typescript
// Via better-auth API
await auth.api.setRole({
  userId: 'user_123',
  role: 'admin',
});
```

#### Authentification Admin (Password + 2FA)

Les super admins utilisent **password + OTP 2FA** pour sécurité maximale :

1. Admin entre email + password
2. Better-auth vérifie password
3. Better-auth génère OTP 2FA
4. Admin reçoit email OTP
5. Admin entre code OTP
6. Session créée avec permissions admin

**Configuration 2FA** :
```typescript
// better-auth.config.ts
twoFactor({
  issuer: "DropIt",
  totpOptions: {
    period: 30,
  },
}),
```

---

## Deep Links - Invitations Mobile

### Concept

Un **deep link** est une URL spéciale qui ouvre directement une application mobile installée sur le device, à une page spécifique avec des paramètres.

**Format** : `dropit://accept-invitation/abc123xyz`

### Comment ça marche ?

#### 1. Configuration App Mobile

Dans le fichier de configuration de l'app (iOS/Android), on déclare un **URL scheme** :

```xml
<!-- iOS: Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>dropit</string>
    </array>
  </dict>
</array>

<!-- Android: AndroidManifest.xml -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="dropit" android:host="accept-invitation" />
</intent-filter>
```

#### 2. Email d'Invitation (Nouveau User)

Le coach invite `john@example.com` qui n'a PAS de compte.

**Email envoyé** :
```html
<p>Vous êtes invité à rejoindre [Nom du Club]</p>

<!-- Bouton principal -->
<a href="https://dropit.com/invite/abc123xyz">
  Accepter l'invitation
</a>
```

#### 3. Landing Page Web (https://dropit.com/invite/{token})

Quand l'user clique sur le lien email, il arrive sur une **landing page web** :

```
┌────────────────────────────┐
│  Vous êtes invité !        │
│                            │
│  [ Ouvrir l'app mobile ]  │  ← Bouton avec deep link
│                            │
│  Pas l'app ?               │
│  [ Télécharger iOS ]       │  ← App Store
│  [ Télécharger Android ]   │  ← Play Store
└────────────────────────────┘
```

**Code de la landing page** :
```typescript
// Page: /invite/[token]
export default function InvitePage({ token }: { token: string }) {
  const handleOpenApp = () => {
    // Tenter d'ouvrir l'app
    window.location.href = `dropit://accept-invitation/${token}`;

    // Si l'app ne s'ouvre pas après 2s, proposer le téléchargement
    setTimeout(() => {
      setShowDownload(true);
    }, 2000);
  };

  return (
    <div>
      <h1>Invitation à rejoindre {organizationName}</h1>
      <button onClick={handleOpenApp}>
        Ouvrir l'app DropIt
      </button>

      {showDownload && (
        <div>
          <p>Vous n'avez pas l'app ?</p>
          <a href="https://apps.apple.com/app/dropit">App Store</a>
          <a href="https://play.google.com/store/apps/dropit">Play Store</a>
        </div>
      )}
    </div>
  );
}
```

#### 4. App Mobile Réagit au Deep Link

L'app mobile intercepte le deep link et extrait le token :

```typescript
// React Native - App.tsx
import { Linking } from 'react-native';

useEffect(() => {
  // Écouter les deep links
  const handleDeepLink = ({ url }: { url: string }) => {
    // url = "dropit://accept-invitation/abc123xyz"

    if (url.startsWith('dropit://accept-invitation/')) {
      const token = url.split('/').pop(); // "abc123xyz"

      // Naviguer vers l'écran d'acceptation d'invitation
      navigation.navigate('AcceptInvitation', { token });
    }
  };

  Linking.addEventListener('url', handleDeepLink);

  // Vérifier si l'app a été ouverte via deep link
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => Linking.removeEventListener('url', handleDeepLink);
}, []);
```

#### 5. Flow Complet Invitation Nouveau User

```
1. Coach invite john@example.com (pas de compte)
    ↓
2. Backend envoie email avec lien: https://dropit.com/invite/abc123
    ↓
3. John clique sur le lien email
    ↓
4. Landing page web s'ouvre
    ↓
5. John clique "Ouvrir l'app"
    ↓
6a. Si app installée:
    → Deep link ouvre l'app: dropit://accept-invitation/abc123
    → App navigue vers écran AcceptInvitation
    → John signup avec OTP
    → Invitation auto-acceptée

6b. Si app PAS installée:
    → Deep link échoue
    → Après 2s, affichage boutons téléchargement
    → John télécharge l'app
    → Ouvre l'app manuellement
    → Entre le code d'invitation abc123 (ou re-clique sur l'email)
    → Signup avec OTP
    → Invitation acceptée
```

### Avantages des Deep Links

✅ **UX fluide** : Passage direct email → app mobile
✅ **Pas de copier-coller** : Le token est automatiquement transmis
✅ **Fallback gracieux** : Si app pas installée, on propose le téléchargement
✅ **Cross-platform** : Fonctionne iOS et Android

### Alternative : Universal Links (iOS) / App Links (Android)

**Problème du deep link simple** : Si l'app n'est pas installée, le lien ne fait rien.

**Solution** : Universal Links (iOS) / App Links (Android)

```
https://dropit.com/invite/abc123

→ Si app installée: ouvre l'app
→ Si app PAS installée: ouvre le site web
```

**Configuration iOS** :
```json
// apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAMID.com.dropit.app",
      "paths": ["/invite/*"]
    }]
  }
}
```

**Hébergé à** : `https://dropit.com/.well-known/apple-app-site-association`

---

## Templates Email

### Templates Disponibles

- `organization-invitation` - Invitation user existant
- `organization-invitation-new-user` - Invitation nouveau user
- `otp-code` - Code OTP (login, signup, reset)
- `workout-reminder` - Rappel entraînement
- `password-reset` - Reset password

### Rendering

Templates inline dans `BrevoAdapter` et `MaildevAdapter`.

**Format** : HTML avec inline CSS (compatibilité email clients)

**Variables** : Passées via `data: Record<string, unknown>`

---

## Base de Données

### User Entity Extensions

```typescript
@Property({ nullable: true })
@Unique()
phone?: string; // Format E.164: +33612345678

@Property({ nullable: true })
phoneVerified?: boolean;

@Property({ nullable: true })
otpMigratedAt?: Date;
```

### DeviceToken Entity (Push)

```typescript
@Entity()
class DeviceToken {
  id: string;
  user: User;
  token: string;        // FCM token
  platform: 'ios' | 'android';
  lastUsedAt: Date;
}
```

---

## Flow d'Invitation Détaillé

### Scénario 1 : User existe

```
1. Coach clique "Invite athlete" → email: john@example.com
2. Backend vérifie: user existe dans DB
3. NotificationUseCase.sendInvitation()
   → Email envoyé (lien accept invitation)
   → Push envoyé (si device tokens trouvés)
4. Athlete reçoit email ET push notification
5. Athlete clique → login OTP → accepte invitation
```

### Scénario 2 : User n'existe pas

```
1. Coach clique "Invite athlete" → email: jane@example.com
2. Backend vérifie: user n'existe PAS
3. NotificationUseCase.sendInvitation()
   → Email envoyé avec lien signup
   → Pas de push (pas de device token)
4. Athlete clique → signup avec OTP → auto-accept invitation
```

---

## Sécurité

### OTP

- **Hashed storage** : OTP stocké en hash dans DB
- **Rate limiting** : Max 5 OTP/heure/user (à implémenter)
- **Short expiration** : 5 minutes
- **Max attempts** : 3 tentatives avant invalidation

### SMS

- **Coût élevé** : Monitoring Twilio requis
- **Spam protection** : Rate limiting strict
- **Phone validation** : Format E.164 requis

### Push

- **Token management** : Device tokens expirés supprimés
- **Graceful degradation** : Échec silencieux si pas de token
- **Data payload** : Pas de données sensibles dans payload

---

## Points d'Attention

### ⚠️ Migration Password → OTP

**Décision** : Migration directe, pas de période de transition (rien en prod actuellement).

**Stratégie** :
- ✅ **Coaches/Athletes** : Supprimer password auth, OTP uniquement
- ✅ **Super Admins** : Garder password + OTP 2FA (Option C)
- ✅ **Plugin admin** : Remplacer `isSuperAdmin` par better-auth `admin` plugin
- ❌ **Pas besoin** de champ `otpMigratedAt` (migration directe)
- ❌ **Pas besoin** de période de transition

**Champ password** :
- Supprimer pour coaches/athletes
- Garder uniquement pour super admins (table `account` avec condition sur role admin)

### ⚠️ SMS Implementation - Phase 3 MVP

**Décision** : Reporter l'implémentation SMS à la Phase 3.

**Phases** :
- **Phase 1** : Email OTP uniquement (gratuit, Brevo/Maildev)
- **Phase 2** : Push notifications (gratuit, Firebase)
- **Phase 3** : SMS OTP pour mobile (quand users le demandent)

**Coûts SMS** :
- Twilio : ~0.07€/SMS
- OVH SMS : ~0.035€/SMS (France, moins cher)
- AWS SNS : ~0.06€/SMS

**Pour Phase 1-2** : Athletes utilisent Email OTP sur mobile app (pas idéal mais fonctionnel)

### ✅ Push Graceful Degradation

- Si push échoue → log + continue (pas d'erreur levée)
- Pas de fallback email pour workout reminders (si pas d'app = pas de compte)
- Device tokens expirés automatiquement supprimés

---

## Testing

### Unit Tests

- `NotificationUseCase.sendOtpEmail()` avec mock `INotificationPort`
- `NotificationUseCase.sendInvitation()` avec mock repository + port

### Integration Tests

- Flow complet signup OTP
- Flow invitation user existant vs nouveau
- Email delivery (Maildev en test)

### E2E Tests

- User signup → OTP email → verification
- User login → OTP → session
- Invitation → email + push → acceptance

---

## Ressources

### Documentation Better-Auth

- [Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp)
- [Phone Number Plugin](https://www.better-auth.com/docs/plugins/phone-number)

### Providers

- [Brevo (Email)](https://www.brevo.com/docs/)
- [Twilio (SMS)](https://www.twilio.com/docs/sms)
- [Firebase (Push)](https://firebase.google.com/docs/cloud-messaging)

### Fichiers Clés

- `apps/api/src/config/better-auth.config.ts` - Config auth
- `apps/api/src/modules/core/auth/auth.service.ts` - Callbacks OTP
- `apps/api/src/modules/core/notification/` - Module notifications
- `apps/web/src/lib/auth-client.ts` - Client auth frontend

---

## Changelog

- **2026-01-11** : Migration OTP planifiée, documentation créée
