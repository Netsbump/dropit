# Mobile auth client — migration vers @better-auth/expo

> Convention: document de backlog technique non contractuel. Il ne décrit pas l'etat reel garanti en production.

**Statut :** `Planned` (le storage manuel actuel fonctionne ; migration à faire pour aligner sur la doc officielle)

---

## Contexte

`apps/mobile/src/lib/auth-client.ts` implémente manuellement le storage des sessions via `AsyncStorage`. La doc officielle better-auth pour Expo recommande le package `@better-auth/expo` avec `expo-secure-store`, qui gère ça proprement et de façon plus sécurisée.

---

## État actuel

```ts
// apps/mobile/src/lib/auth-client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authClient = createAuthClient({
  storage: {
    get: async (key) => { /* manuel */ },
    set: async (key, value) => { /* manuel */ },
    remove: async (key) => { /* manuel */ },
  },
});
```

## Cible

```ts
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  plugins: [
    expoClient({
      scheme: 'dropit',
      storage: SecureStore,
    }),
    // ... autres plugins
  ],
});
```

---

## Ce que ça apporte

- **Sécurité** : `expo-secure-store` stocke les tokens dans le trousseau iOS / Keystore Android, pas en clair comme `AsyncStorage`.
- **Cookies** : `expoClient` gère la gestion des cookies better-auth automatiquement.
- **Deep links OAuth** : nécessaire si OAuth (Google, etc.) est ajouté plus tard.

---

## Étapes

1. `pnpm --filter mobile add @better-auth/expo expo-secure-store`
2. Remplacer le bloc `storage` manuel et l'import `AsyncStorage` par `expoClient({ scheme: 'dropit', storage: SecureStore })` dans `auth-client.ts`.
3. Supprimer `@react-native-async-storage/async-storage` si plus utilisé ailleurs.
4. Tester le flux OTP email complet sur iOS et Android.

---

**Voir aussi :** [`deep-links-mobile-download-app.md`](./deep-links-mobile-download-app.md)
