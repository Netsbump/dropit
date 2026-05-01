# Super admin : 2FA & réinitialisation mot de passe — suivi

> Convention: document de backlog technique non contractuel. Il ne décrit pas l'etat reel garanti en production.

**Statut :** `Partially implemented` (restriction `sign-in/email` côté serveur **déjà en place** ; 2FA et reset mot de passe **non implémentés**)

Document de suivi pour renforcer la sécurité des comptes **super admin** (rôle `user.role === 'admin'`) et pour un éventuel flux de **réinitialisation de mot de passe** self-service.

**Documents liés :**

- Auth module : [`../../apps/api/src/modules/auth/README.md`](../../apps/api/src/modules/auth/README.md)
- Notifications (types, ports) : [`../../apps/api/src/modules/notification/README.md`](../../apps/api/src/modules/notification/README.md)

---

## État actuel

### Connexion super admin (mot de passe)

- Le backoffice super admin utilise **email + mot de passe** (`emailAndPassword`), formulaire web dédié.
- **Restriction serveur** : le hook `before` dans [`better-auth.config.ts`](../../apps/api/src/modules/auth/better-auth.config.ts) limite la route **`/sign-in/email`** aux comptes dont l’email correspond à un super admin (`checkIsSuperAdminByEmail`). Les autres reçoivent une erreur `FORBIDDEN` (« Password sign-in is restricted to admin accounts »).

### 2FA (second facteur)

- **Non implémenté** : pas de plugin TOTP / 2FA better-auth exposé pour le login admin ; session = email + mot de passe uniquement.

### Réinitialisation mot de passe

- **Non implémenté** côté produit (pas de parcours « mot de passe oublié » complet identifié dans le flux web principal).
- Le port notification peut prévoir un type `PASSWORD_RESET` (intention future) — à aligner avec better-auth (`forgotPassword` / email de reset) quand le produit tranchera.

---

## Objectifs futurs

### 1. Second facteur pour super admin (2FA)

- **Pourquoi** : réduire le risque en cas de fuite de mot de passe sur un compte à privilèges élevés.
- **Options typiques** : TOTP (application d’authentification), ou étape OTP email après saisie du mot de passe, selon arbitrage produit / UX.
- **Décisions à prendre** : récupération en cas de perte du second facteur, politique pour les comptes admin existants.

### 2. Réinitialisation de mot de passe

- **Pourquoi** : permettre aux super admins de réinitialiser un mot de passe oublien sans intervention manuelle, avec le même niveau de sécurité que le reste du produit.
- **À prévoir** : flux better-auth + email transactionnel + expiration des tokens ; cohérence avec les mentions légales / confidentialité.

---

## Hors scope (rappel)

- Ce document ne couvre pas l’OTP email des coachs / membres (voir [Auth README — Authentication overview](../../apps/api/src/modules/auth/README.md#authentication-overview)).

---

## Plan d’implémentation future (indicatif)

1. Choisir le mécanisme 2FA (TOTP vs email OTP post-login).
2. Intégrer côté `better-auth.config.ts` et client web admin.
3. Définir le flux reset : routes, emails, limitation anti-abus.
4. Brancher les notifications (`PASSWORD_RESET` ou équivalent) dans le module notification.
5. Tests manuels et tests d’intégration sur les routes `/auth/*` concernées.

---

## Critères d’acceptation

- [ ] 2FA activable pour les comptes super admin (ou décision documentée d’alternative).
- [ ] Parcours reset mot de passe sécurisé et testé.
- [ ] README auth et ce fichier restent alignés avec le code.

---

**Voir aussi :** [`deep-links-mobile-download-app.md`](./deep-links-mobile-download-app.md) · [`mobile-notification-preferences-phonenumber.md`](./mobile-notification-preferences-phonenumber.md)
