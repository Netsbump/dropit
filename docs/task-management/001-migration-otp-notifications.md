# Guide Migration OTP + Amélioration Notifications

## Vue d'ensemble

**Objectif**: Migrer de password auth vers OTP-only avec better-auth, et améliorer le système de notifications.

**Décisions clés**:
- ✅ Better-auth avec plugins `emailOTP` + `phoneNumber`
- ✅ Supprimer password auth complètement
- ✅ Email OTP pour web, SMS OTP pour mobile
- ✅ Migrer `email` module → `notification` module
- ✅ Invitations: Email + Push si user existe, Email seul sinon

---

## Architecture actuelle vs cible

### Actuel
```
better-auth (emailAndPassword)
    ↓
EmailService → Brevo/Maildev
```

### Cible
```
better-auth (emailOTP + phoneNumber)
    ↓
NotificationUseCase → NotificationAdapter
    ↓
Email/SMS/Push providers
```

---

## TODO List

### ✅ Fait
- [x] Structure NotificationModule créée
- [x] Ports IN/OUT définis
- [x] Email adapters (Brevo/Maildev) créés
- [x] Templates email de base

### 📝 À faire

#### Phase 1: Base de données
- [ ] Ajouter champ `phone` à User entity (nullable, unique, E.164 format)
- [ ] Ajouter champ `phoneVerified` à User entity
- [ ] Ajouter champ `otpMigratedAt` à User entity
- [ ] Créer migration MikroORM pour ces champs
- [ ] Créer entity `DeviceToken` pour push notifications
- [ ] Créer migration pour table `device_token`

#### Phase 2: Better-auth OTP
- [ ] Installer dépendances: `libphonenumber-js`, `twilio`, `firebase-admin`
- [ ] Ajouter variables env (Twilio, Firebase)
- [ ] Dans `better-auth.config.ts`: supprimer `emailAndPassword` plugin
- [ ] Dans `better-auth.config.ts`: supprimer `emailVerification` plugin
- [ ] Dans `better-auth.config.ts`: ajouter `emailOTP` plugin avec config
- [ ] Dans `better-auth.config.ts`: ajouter `phoneNumber` plugin avec config
- [ ] Mettre à jour interface `BetterAuthOptionsDynamic` avec callback `sendOTP`

#### Phase 3: NotificationModule
- [ ] Créer port OUT `sms.port.ts` (ISmsPort, ISmsParams)
- [ ] Créer port OUT `push.port.ts` (IPushPort, IPushParams)
- [ ] Créer adapter `twilio.adapter.ts` (implémente ISmsPort)
- [ ] Créer adapter `fcm.adapter.ts` (implémente IPushPort)
- [ ] Dans `notification.use-cases.ts`: ajouter méthode `sendOtpEmail()`
- [ ] Dans `notification.use-cases.ts`: ajouter méthode `sendOtpSms()`
- [ ] Dans `notification.use-cases.ts`: mettre à jour `sendInvitation()` pour push
- [ ] Dans `notification.adapter.ts`: injecter SMS_PORT et PUSH_PORT
- [ ] Dans `notification.adapter.ts`: implémenter `sendSms()` (enlever throw)
- [ ] Dans `notification.adapter.ts`: implémenter `sendPush()` (enlever throw)
- [ ] Dans `notification.module.ts`: ajouter providers SMS et Push
- [ ] Créer template email OTP dans adapters (déjà existant, vérifier)

#### Phase 4: Connecter better-auth → NotificationModule
- [ ] Dans `auth.service.ts`: remplacer injection `EmailService` par `NotificationUseCase`
- [ ] Dans `auth.service.ts`: implémenter callback `sendOTP` qui appelle notification use case
- [ ] Dans `auth.service.ts`: mettre à jour callback `sendInvitationEmail` (utilise déjà notification)
- [ ] Tester avec Maildev: signup → OTP envoyé → vérifier email reçu

#### Phase 5: Supprimer EmailModule
- [ ] Identifier tous les imports de `EmailService` ou `EmailModule`
- [ ] Remplacer par imports de `NotificationModule`
- [ ] Supprimer dossier `apps/api/src/modules/core/email/`
- [ ] Vérifier compilation sans erreurs

#### Phase 6: Frontend Web - Composants OTP
- [ ] Créer composant `OTPInput.tsx` (6 digits, auto-focus, paste support)
- [ ] Créer composant `LoginFormOTP.tsx` (étape 1: email, étape 2: OTP)
- [ ] Créer composant `SignupFormOTP.tsx` (name/email → OTP auto-envoyé)
- [ ] Ajouter countdown timer pour resend OTP
- [ ] Remplacer `login-form.tsx` par `LoginFormOTP`
- [ ] Remplacer signup form par `SignupFormOTP`
- [ ] Mettre à jour route invitation acceptance avec OTP

#### Phase 7: Tests
- [ ] Test unitaire: `sendOtpEmail()` use case
- [ ] Test unitaire: `sendOtpSms()` use case
- [ ] Test intégration: flow signup OTP complet
- [ ] Test intégration: flow login OTP complet
- [ ] Test intégration: invitation existing user (email + push)
- [ ] Test intégration: invitation new user (email seul)
- [ ] Test E2E: signup → login → invitation
- [ ] Test manuel: OTP expiration (5 min)
- [ ] Test manuel: OTP max attempts (3 échecs)
- [ ] Test manuel: resend OTP

#### Phase 8: Documentation
- [ ] Créer README dans `notification/` module
- [ ] Documenter flow OTP pour équipe
- [ ] Documenter configuration Twilio
- [ ] Documenter configuration Firebase
- [ ] Préparer FAQ support utilisateurs

#### Phase 9: Déploiement
- [ ] Tester migration sur staging
- [ ] Backup base de données prod
- [ ] Deploy backend avec OTP
- [ ] Deploy frontend avec OTP
- [ ] Monitor logs 48h
- [ ] Collecter feedback utilisateurs

---

## Détails par phase

### Phase 1: Base de données

#### User Entity
```typescript
// apps/api/src/modules/identity/domain/auth/user.entity.ts

@Property({ nullable: true })
@Unique()
phone?: string; // Format: +33612345678

@Property({ nullable: true })
phoneVerified?: boolean;

@Property({ nullable: true })
otpMigratedAt?: Date;
```

#### DeviceToken Entity (nouveau fichier)
```typescript
// apps/api/src/modules/identity/domain/auth/device-token.entity.ts

@Entity({ tableName: 'device_token' })
export class DeviceToken {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  @Property()
  token!: string; // FCM token

  @Property()
  platform!: 'ios' | 'android';

  @Property()
  lastUsedAt!: Date;

  @Property()
  createdAt: Date = new Date();
}
```

#### Migration SQL
```sql
ALTER TABLE "user" ADD COLUMN "phone" VARCHAR(20) NULL;
ALTER TABLE "user" ADD COLUMN "phoneVerified" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN "otpMigratedAt" TIMESTAMP NULL;
CREATE UNIQUE INDEX "user_phone_unique" ON "user"("phone") WHERE "phone" IS NOT NULL;

CREATE TABLE "device_token" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL,
  "platform" VARCHAR(10) NOT NULL,
  "lastUsedAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Phase 2: Better-auth OTP

#### Dépendances
```bash
pnpm add libphonenumber-js twilio firebase-admin
```

#### Variables environnement
```bash
# .env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+33xxxxxxxxx

FIREBASE_PROJECT_ID=dropit-prod
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/firebase-key.json
```

#### Configuration better-auth
```typescript
// apps/api/src/config/better-auth.config.ts

import { emailOTP, phoneNumber } from "better-auth/plugins";

// SUPPRIMER ces lignes:
// emailAndPassword: { ... }
// emailVerification: { ... }

// AJOUTER:
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    await options?.sendOTP?.({
      email,
      otp,
      type,
      transport: 'email'
    });
  },
  otpLength: 6,
  expiresIn: 300, // 5 minutes
  sendOnSignUp: true,
  allowedAttempts: 3,
  storeOTP: "hashed",
}),

phoneNumber({
  async sendOTP({ phoneNumber, otp }) {
    await options?.sendOTP?.({
      phoneNumber,
      otp,
      transport: 'sms'
    });
  },
  otpLength: 6,
  expiresIn: 300,
}),
```

#### Interface mise à jour
```typescript
interface BetterAuthOptionsDynamic {
  sendOTP?: (data: {
    email?: string;
    phoneNumber?: string;
    otp: string;
    type?: 'sign-in' | 'email-verification' | 'forget-password';
    transport: 'email' | 'sms';
  }) => Promise<void>;

  sendInvitationEmail?: (...) => Promise<void>;
}
```

---

### Phase 3: NotificationModule

#### Port SMS
```typescript
// apps/api/src/modules/core/notification/application/ports/out/sms.port.ts

export interface ISmsParams {
  to: string;
  message: string;
}

export interface ISmsPort {
  send(params: ISmsParams): Promise<void>;
}

export const SMS_PORT = Symbol('SMS_PORT');
```

#### Adapter Twilio
```typescript
// apps/api/src/modules/core/notification/infrastructure/sms/twilio.adapter.ts

import Twilio from 'twilio';
import { ISmsPort } from '../../application/ports/out/sms.port';

@Injectable()
export class TwilioAdapter implements ISmsPort {
  private client: Twilio.Twilio;

  constructor() {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async send(params: ISmsParams): Promise<void> {
    await this.client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: params.to,
      body: params.message,
    });
  }
}
```

#### Méthodes NotificationUseCase
```typescript
// Ajouter dans notification.use-cases.ts

async sendOtpEmail(params: {
  email: string;
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}): Promise<void> {
  const subjectMap = {
    'sign-in': 'Votre code de connexion',
    'email-verification': 'Vérifiez votre email',
    'forget-password': 'Réinitialisez votre mot de passe',
  };

  await this.notificationPort.sendEmail({
    to: params.email,
    subject: subjectMap[params.type],
    template: 'otp-code',
    data: {
      otp: params.otp,
      expiresIn: '5 minutes',
      type: params.type,
    },
  });
}

async sendOtpSms(params: {
  phoneNumber: string;
  otp: string;
}): Promise<void> {
  await this.notificationPort.sendSms({
    to: params.phoneNumber,
    message: `Votre code DropIt: ${params.otp}. Expire dans 5 minutes.`,
  });
}
```

#### Mise à jour sendInvitation
```typescript
// Dans notification.use-cases.ts, mettre à jour:

async sendInvitation(params: {
  organizationId: string;
  organizationName: string;
  email: string;
  invitedBy: string;
  invitationToken: string;
}): Promise<void> {
  const existingUser = await this.userRepository.getByEmail(params.email);

  if (existingUser) {
    // User existe: email + push
    await Promise.all([
      this.notificationPort.sendEmail({
        to: params.email,
        subject: `Invitation à rejoindre ${params.organizationName}`,
        template: 'organization-invitation',
        data: {
          organizationName: params.organizationName,
          invitedBy: params.invitedBy,
          token: params.invitationToken,
        },
      }),
      this.notificationPort.sendPush({
        userId: existingUser.id,
        title: 'Nouvelle invitation',
        body: `${params.invitedBy} vous invite à rejoindre ${params.organizationName}`,
        data: {
          type: 'invitation',
          invitationId: params.invitationToken,
        },
      }).catch(err => {
        // Graceful degradation si pas de device token
        console.log('Push notification failed (web-only user?):', err.message);
      }),
    ]);
  } else {
    // User n'existe pas: email seul
    await this.notificationPort.sendEmail({
      to: params.email,
      subject: `Vous êtes invité à rejoindre DropIt`,
      template: 'organization-invitation-new-user',
      data: {
        organizationName: params.organizationName,
        invitedBy: params.invitedBy,
        token: params.invitationToken,
      },
    });
  }
}
```

---

### Phase 4: Connecter better-auth

```typescript
// apps/api/src/modules/core/auth/auth.service.ts

// REMPLACER:
// import { EmailService } from '../email/email.service';
// constructor(private emailService: EmailService, ...)

// PAR:
import { INotificationUseCases, NOTIFICATION_USE_CASES } from '../notification/application/ports/in/notification-use-cases.port';

constructor(
  @Inject(NOTIFICATION_USE_CASES)
  private notificationUseCase: INotificationUseCases,
  private em: EntityManager
) {}

// Dans initialize():
this._auth = createAuthConfig({
  sendOTP: async (data) => {
    if (data.transport === 'email' && data.email) {
      await this.notificationUseCase.sendOtpEmail({
        email: data.email,
        otp: data.otp,
        type: data.type || 'sign-in',
      });
    } else if (data.transport === 'sms' && data.phoneNumber) {
      await this.notificationUseCase.sendOtpSms({
        phoneNumber: data.phoneNumber,
        otp: data.otp,
      });
    }
  },

  sendInvitationEmail: async (data) => {
    await this.notificationUseCase.sendInvitation({
      organizationId: data.organization.id,
      organizationName: data.organization.name,
      email: data.email,
      invitedBy: data.inviter.user.name,
      invitationToken: data.id,
    });
  },
}, this.em);
```

---

### Phase 6: Frontend OTP

#### Composant OTPInput
```tsx
// apps/web/src/shared/components/auth/otp-input.tsx

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Complete
    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  return (
    <div className="flex gap-2">
      {otp.map((digit, i) => (
        <Input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          className="w-12 h-12 text-center text-2xl"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
```

#### LoginFormOTP
```tsx
// apps/web/src/shared/components/auth/login-form-otp.tsx

export function LoginFormOTP({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await authClient.emailOTP.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      setStep('otp');
      setCountdown(60);
      toast({ title: 'Code envoyé à ' + email });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      const res = await authClient.emailOTP.verifyEmail({
        email,
        otp,
      });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => onSuccess?.(),
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (step === 'email') {
    return (
      <form onSubmit={e => { e.preventDefault(); sendOtpMutation.mutate(email); }}>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.com"
        />
        <Button type="submit">Envoyer le code</Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <p>Code envoyé à <strong>{email}</strong></p>

      <OTPInput onComplete={otp => verifyOtpMutation.mutate(otp)} />

      {countdown > 0 ? (
        <p>Renvoyer dans {countdown}s</p>
      ) : (
        <Button onClick={() => sendOtpMutation.mutate(email)}>
          Renvoyer le code
        </Button>
      )}

      <Button variant="ghost" onClick={() => setStep('email')}>
        Modifier l'email
      </Button>
    </div>
  );
}
```

---

## Points d'attention

### ⚠️ Garder password field temporairement
Le champ `password` dans la table `account` doit rester pendant 3-6 mois pour permettre une migration douce. Ne PAS supprimer immédiatement.

### ⚠️ Phone optionnel
Le champ `phone` est **optionnel**. Les utilisateurs web peuvent rester avec email OTP uniquement.

### ⚠️ SMS coûte cher
Implémenter rate limiting et monitoring des coûts Twilio dès le début.

### ✅ Push graceful degradation
Si pas de device token, le push échoue silencieusement. L'email est toujours envoyé comme backup.

### ✅ Better-auth gère expiration OTP
Pas besoin de Redis ou cache custom, better-auth stocke et gère l'expiration des OTP.

---

## Ressources

### Documentation
- [Better-auth Email OTP](https://www.better-auth.com/docs/plugins/email-otp)
- [Better-auth Phone Number](https://www.better-auth.com/docs/plugins/phone-number)
- [Twilio Node SDK](https://www.twilio.com/docs/libraries/node)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Fichiers existants importants
- `apps/api/src/config/better-auth.config.ts` - Configuration auth
- `apps/api/src/modules/core/auth/auth.service.ts` - Service auth
- `apps/api/src/modules/core/notification/` - Module notification (déjà créé)
- `apps/web/src/lib/auth-client.ts` - Client auth frontend

---

## Questions pour review

1. **SMS Provider**: Twilio ok ou préférer OVH SMS (France) ?
2. **Phone obligatoire** pour athletes mobiles ou optionnel ?
3. **Migration password**: Période de transition 3 mois suffisante ?
4. **Push notifications**: Firebase ok ou préférer OneSignal ?
5. **Rate limiting**: 5 OTP/heure ok ou trop restrictif ?
6. **Templates email**: Garder inline dans adapters ou externaliser (Handlebars) ?

---

## Next steps

1. Review ce document ensemble
2. Répondre aux questions ci-dessus
3. Commencer par Phase 1 (BDD) quand prêt
4. Tester chaque phase sur dev avant de passer à la suivante
