# Deep links mobile & page téléchargement — suivi

**Statut :** `Planned` (spécification et checklist ; implémentation mobile/web à venir)

Document de suivi pour ouvrir l’app depuis le web (invitations, onboarding) et pour aligner les **liens App Store / Play Store** sur la page `/download-app`.

**Documents liés :**

- Auth (OTP email, schéma clients) : [`../../apps/api/src/modules/auth/README.md`](../../apps/api/src/modules/auth/README.md)
- Onboarding (flux invitation web) : [`../../apps/api/src/modules/auth/README-onboarding.md`](../../apps/api/src/modules/auth/README-onboarding.md)
- Page web : [`../../apps/web/src/routes/download-app.tsx`](../../apps/web/src/routes/download-app.tsx)

---

## Contexte

Aujourd’hui, après acceptation d’invitation, le web redirige vers **`/download-app`** (session requise). Il n’y a pas encore de schéma d’URL universel ni de **deep link** qui ouvre l’app avec un token ; le parcours est **web-first**.

---

## Qu’est-ce qu’un deep link ?

Un **deep link** est une URL qui, lorsqu’elle est ouverte sur un appareil, lance une application mobile installée et navigue vers un écran précis avec des paramètres (ex. token d’invitation).

**Exemple de schéma custom :** `dropit://accept-invitation/{token}`

Sur iOS/Android on peut aussi utiliser des **Universal Links** / **App Links** (https) pour une meilleure intégration avec le navigateur et les emails.

---

## État actuel vs cible

| Sujet | État actuel | Cible |
|--------|-------------|--------|
| Invitation athlète | Lien web → `/accept-invitation/:id` → API onboarding → `/download-app` | Optionnel : lien qui ouvre l’app si installée, sinon landing + téléchargement |
| Config Expo / schéma | À vérifier dans `apps/mobile` (`scheme`, associated domains) | Déclarer le schéma ou les domaines associés |
| Liens stores sur `/download-app` | Placeholders + `TODO` dans le code (voir ci-dessous) | URLs réelles des fiches App Store et Play Store |

### Fichiers code à aligner (stores)

Les boutons iOS/Android appellent encore des URLs d’exemple. Lors de la publication sur les stores, remplacer par les **vrais** liens et retirer le `TODO` dans :

- [`apps/web/src/routes/download-app.tsx`](../../apps/web/src/routes/download-app.tsx) — fonction `handleDownload` (lignes ~45–54 au moment de la rédaction)

Vérifier la cohérence avec l’identifiant Android du build publié (ex. `applicationId` dans le projet mobile), pas seulement les placeholders du type `com.dropit`.

---

## Checklist d’implémentation future

1. **Produit** : définir les URLs canoniques (landing web vs deep link uniquement).
2. **Mobile** : configurer `scheme` / `expo-linking` ou équivalent ; écouter `Linking` pour parser token + route.
3. **Web** : bouton « Ouvrir l’app » sur une page intermédiaire si besoin ; fallback téléchargement après timeout si l’app ne s’ouvre pas.
4. **Stores** : publier l’app et reporter les URLs finales dans `download-app.tsx` (et éventuellement variables d’environnement).
5. **Tests manuels** : lien depuis email → navigateur → app installée / non installée.

---

## Référence pédagogique (pseudo-code)

### Landing web — tentative d’ouverture de l’app

```typescript
const handleOpenApp = () => {
  window.location.href = `dropit://accept-invitation/${token}`;
  setTimeout(() => setShowDownload(true), 2000);
};
```

### React Native — écoute du deep link

```typescript
import { Linking } from 'react-native';

useEffect(() => {
  const handleDeepLink = ({ url }: { url: string }) => {
    if (url.startsWith('dropit://accept-invitation/')) {
      const token = url.split('/').pop();
      navigation.navigate('AcceptInvitation', { token });
    }
  };
  const sub = Linking.addEventListener('url', handleDeepLink);
  Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
  return () => sub.remove();
}, []);
```

### Flux invitation (nouvel utilisateur) — vision cible

```
1. Coach invite l’athlète
2. Email avec lien web (et/ou deep link)
3. Athlète ouvre → landing ou app
4. Si app : navigation vers acceptation / login OTP email
5. Si pas d’app : téléchargement via liens store (page /download-app ou équivalent)
```

---

## Critères d’acceptation (quand ce sera fait)

- [ ] Schéma ou App Links documentés et configurés côté mobile.
- [ ] Page `/download-app` pointe vers les **vraies** URLs App Store et Play Store.
- [ ] Parcours testé sur iOS et Android (app installée / non installée).

---

**Voir aussi :** [`mobile-notification-preferences-phonenumber.md`](./mobile-notification-preferences-phonenumber.md) · [`super-admin-2fa-password-reset.md`](./super-admin-2fa-password-reset.md)
