# Préférences mobile : numéro de téléphone pour alertes SMS — suivi

> Convention: document de backlog technique non contractuel. Il ne décrit pas l'etat reel garanti en production.

**Statut :** `Planned` (pas de login par numéro ; stockage / SMS pour préférences utilisateur uniquement)

Document de suivi pour permettre à un utilisateur mobile d’indiquer un **numéro de téléphone** et de **préférer recevoir certaines alertes par SMS** plutôt que par email — **sans** utiliser le téléphone comme identifiant de connexion.

**Documents liés :**

- Auth (OTP email, vue d’ensemble) : [`../../apps/api/src/modules/auth/README.md`](../../apps/api/src/modules/auth/README.md)
- Module notification : [`../../apps/api/src/modules/notification/README.md`](../../apps/api/src/modules/notification/README.md)

---

## Contexte

- L’authentification reste basée sur **OTP par email** (et mot de passe réservé au super admin côté web), décrite dans le [README auth](../../apps/api/src/modules/auth/README.md).
- Le plugin better-auth **`phoneNumber`** pour **sign-in / sign-up par SMS** est **hors périmètre** produit.

---

## Objectif cible

- Stocker un numéro (format validé, ex. E.164) **en tant que donnée de profil ou préférence**, pour routage des notifications.
- Permettre à l’utilisateur de choisir le **canal** pour certaines catégories d’alertes : email et/ou SMS (selon produit et consentement).
- Brancher l’envoi réel SMS dans `SmsAdapter` (Twilio ou autre) lorsque le canal SMS est choisi.

---

## Hors scope (explicite)

- **Connexion ou inscription avec le numéro de téléphone** (pas de `phoneNumber` better-auth pour l’auth).
- OTP par SMS pour remplacer l’OTP email sur le flux login mobile.

---

## État actuel (référence dépôt)

- Pas de champs `phoneNumber` / `phoneNumberVerified` sur l’entité `User` ni migration dédiée **pour les préférences** (à créer selon modèle de données retenu).
- `SmsAdapter` peut encore lever `NotificationServiceNotConfiguredException` tant que le transport SMS n’est pas configuré — voir module notification.

---

## Plan d’implémentation future (indicatif)

1. **Modèle** : décider où vit le numéro (User vs table préférences) et les flags « alertes par SMS » (RGPD / consentement).
2. **API** : endpoints ou champs de mise à jour des préférences (mobile + éventuellement web).
3. **Validation** : normalisation E.164, opt-in explicite pour SMS.
4. **Notifications** : étendre `NotificationAdapter` / types de requêtes pour router vers SMS quand la préférence l’exige ; implémenter `SmsAdapter` (ex. Twilio).
5. **Mobile** : écrans préférences + affichage des conditions d’usage.

---

## Critères d’acceptation

- [ ] L’utilisateur peut enregistrer un numéro **sans** que ce numéro serve à se connecter.
- [ ] Les alertes concernées peuvent être reçues par SMS lorsque l’option est activée et le transport configuré.
- [ ] Documentation auth / onboarding ne décrit plus un « login par téléphone » comme cible produit.

---

**Voir aussi :** [`deep-links-mobile-download-app.md`](./deep-links-mobile-download-app.md) · [`super-admin-2fa-password-reset.md`](./super-admin-2fa-password-reset.md)
