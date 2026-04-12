# Migration auth OTP & notifications — suivi

Document de **suivi** (état réel du dépôt + reste à faire). Diagramme d’ensemble (clients → better-auth → notifications) : section **Authentication overview** du [`README du module auth`](../../apps/api/src/modules/auth/README.md). Module notifications (ports, exemple invitation) : [`apps/api/src/modules/notification/README.md`](../../apps/api/src/modules/notification/README.md).

## Déjà en place

- **Backend better-auth** : plugin `emailOTP`, callback `sendVerificationOTP` branché sur `INotificationUseCases.sendOtp()` avec `{ email, otp, type }` depuis `BetterAuthAdapter` (`apps/api/src/modules/auth/infrastructure/better-auth.adapter.ts`).
- **Config** : `emailAndPassword` conservé pour les comptes avec mot de passe ; `emailOTP` avec `disableSignUp: true` ; certaines routes désactivées via `disabledPaths` dans `better-auth.config.ts` (réduire la surface d’attaque).
- **Notifications** : un seul use case `sendOtp` avec un type union (email **ou** numéro prévu pour plus tard) ; routage email dans `NotificationAdapter` pour l’OTP par email.
- **Web (backoffice)** : client `emailOTPClient` ; flux coach en OTP (`login-otp-form`, `login-email-form`, etc.) et volet **admin** séparé en mot de passe (`login-admin-form`, route dédiée).
- **Invitation athlète** : à l’invitation, `prepareUserForInvitation` peut **créer l’utilisateur** (sans parcours signup web classique) ; l’acceptation sur le web passe par l’**API onboarding** ts-rest, pas par `acceptInvitation` better-auth (voir [`README-onboarding.md`](../../apps/api/src/modules/auth/README-onboarding.md)).

## Pas fait ou partiel

- **Plugin `phoneNumber` better-auth** : non activé ; pas de champs `phoneNumber` / `phoneNumberVerified` sur l’entité `User` ni migration associée.
- **SMS** : `SmsAdapter` lève encore `NotificationServiceNotConfiguredException` ; pas d’envoi réel (Twilio ou autre) branché sur `sendOtp` avec `phoneNumber`.
- **App mobile** : flux OTP email / téléphone côté client mobile à aligner sur la cible (si l’app existe dans le repo, à vérifier fichier par fichier).
- **2FA / OTP après mot de passe pour super admin** : non implémenté ; aujourd’hui le login admin est **email + mot de passe** uniquement (voir formulaire admin web).
- **Restriction stricte** « seuls les super admins peuvent utiliser `signIn.email` » : pas de garde serveur dédiée documentée dans le code ; mitigation actuelle surtout **UX** (routes / formulaires séparés).

## Ordre suggéré pour la suite

1. Champs utilisateur + migration + plugin `phoneNumber` si le produit veut le login par SMS.
2. Implémenter l’envoi SMS (Twilio ou mock dev) dans `SmsAdapter` et tests d’intégration minimaux.
3. Mobile : mêmes primitives client que le web (`emailOTPClient`, puis `phoneNumberClient` quand le backend est prêt).
4. Optionnel : 2FA admin ou hook serveur pour limiter `signIn.email` aux rôles admin.

## Liens utiles

- [Better-auth — Email OTP](https://www.better-auth.com/docs/plugins/email-otp)
- [Better-auth — Phone Number](https://www.better-auth.com/docs/plugins/phone-number)


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