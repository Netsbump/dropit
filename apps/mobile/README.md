# DropIt Mobile App

Application mobile React Native avec Expo pour la gestion d'entraînements d'haltérophilie.

## 🚀 Fonctionnalités

- ✅ **Authentification Better Auth** - Connexion sécurisée avec email/mot de passe
- ✅ **Support Bearer Token** - Gestion automatique des tokens pour les API calls
- ✅ **AsyncStorage** - Persistance de session locale
- ✅ **Packages partagés** - Utilisation des schémas et contrats du monorepo
- ✅ **TypeScript** - Typage complet avec validation Zod
- ✅ **Design responsive** - Interface optimisée mobile

## 🛠 Architecture

```
src/
├── components/
│   ├── AuthProvider.tsx      # Gestion globale de l'authentification
│   ├── LoginScreen.tsx       # Écran de connexion
│   └── DashboardScreen.tsx   # Écran principal après connexion
├── lib/
│   ├── auth-client.ts        # Configuration Better Auth mobile
│   └── api.ts               # Client API avec Bearer token
```

## 📱 Configuration Better Auth

### Client d'authentification (`src/lib/auth-client.ts`)

Le client Better Auth est configuré spécialement pour React Native :

```typescript
export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [organizationClient({ ac, roles: { owner, admin, member } })],
  storage: {
    // Configuration AsyncStorage pour React Native
    get: async (key: string) => AsyncStorage.getItem(key),
    set: async (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
    remove: async (key: string) => AsyncStorage.removeItem(key),
  },
});
```

### API Client avec Bearer Token (`src/lib/api.ts`)

```typescript
export const api = initClient(apiContract, {
  baseUrl: 'http://localhost:3000/api',
  api: async (args: any) => {
    // Récupération automatique du token depuis AsyncStorage
    const authData = await AsyncStorage.getItem('better-auth.session-token');
    const token = authData ? JSON.parse(authData) : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Requête avec Bearer token
    return fetch(args.path, {
      method: args.method,
      headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
    });
  },
});
```

## 🔐 Flux d'authentification

L'authentification utilise un **Context React** pour gérer l'état global de la session.

### 1. Connexion
```typescript
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123'
});
```

### 2. Gestion de session
```typescript
const sessionData = await authClient.getSession();
if (sessionData.data) {
  // Utilisateur connecté
  setSession(sessionData.data);
}
```

### 3. Déconnexion (via Context)
```typescript
import { useAuth } from './components/AuthProvider';

export default function AccountScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // Déconnexion + redirection automatique vers LoginScreen
  };
}
```

Le pattern avec `useAuth()` permet :
- ✅ Accès global à la fonction de déconnexion
- ✅ Redirection automatique vers le LoginScreen
- ✅ Pas de prop drilling

## 🧩 Intégration des packages partagés

L'app mobile utilise tous les packages partagés du monorepo :

- **@dropit/contract** - Contrats API typés
- **@dropit/schemas** - Validation Zod
- **@dropit/i18n** - Internationalisation

### Exemple d'utilisation des schémas :

```typescript
import { athleteSchema } from '@dropit/schemas';

const testAthlete = athleteSchema.parse({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  organizationId: 'org-1'
});
```

## 📋 Configuration du serveur

Le serveur API doit être configuré avec support Bearer token :

```typescript
// better-auth.config.ts
bearerToken: {
  enabled: true,  // ✅ Activé pour mobile
},
```

## 🚀 Démarrage

### Prérequis
- API backend démarrée sur `localhost:3000`
- Base de données configurée
- Expo CLI installé

### Commandes

```bash
# Installation des dépendances
pnpm install

# Démarrage de l'app mobile
pnpm dev:mobile

# Vérification TypeScript
pnpm --filter mobile typecheck

# Dans un autre terminal, démarrer l'API
pnpm --filter api dev
```

### Test sur appareil

1. Installer **Expo Go** sur votre smartphone
2. Scanner le QR code affiché dans le terminal
3. L'app se charge avec l'écran de connexion

## 📦 Build et déploiement de l'APK

### Prérequis
- Compte Expo créé et authentifié : `npx eas login`
- Projet EAS configuré

### Profils de build disponibles

Le projet utilise **EAS Build** avec 3 profils configurés dans `eas.json` :

| Profil | Usage | API URL |
|--------|-------|---------|
| `development` | Dev avec hot reload | Variable d'env locale |
| `preview` | Test en prod (APK) | `https://api.dropit-app.fr` |
| `production` | Publication Play Store | Variable d'env prod |

### Build d'un APK pour tester (Preview)

```bash
# Se placer dans le dossier mobile
cd apps/mobile

# Build APK avec le profil preview (connecté à l'API de prod)
npx eas build --platform android --profile preview

# Le build se fait dans le cloud Expo
# Temps estimé : 5-10 minutes
# Vous recevrez un lien pour télécharger l'APK
```

### Build local (plus rapide)

```bash
# Build local sans utiliser les serveurs Expo
npx eas build --platform android --profile preview --local

# Nécessite Android SDK installé localement
```

### Installation de l'APK sur votre téléphone

1. Une fois le build terminé, EAS vous donne un **lien de téléchargement**
2. Téléchargez l'APK sur votre téléphone
3. Activez "Sources inconnues" dans les paramètres Android
4. Installez l'APK

### Variables d'environnement

Le profil **preview** utilise automatiquement :
```bash
EXPO_PUBLIC_API_URL=https://api.dropit-app.fr
```

Pour changer l'URL de l'API, modifiez `eas.json` :
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://votre-api.com"
      }
    }
  }
}
```

### Commandes utiles EAS

```bash
# Lister les builds précédents
npx eas build:list

# Voir les détails d'un build
npx eas build:view [BUILD_ID]

# Build iOS (nécessite compte Apple Developer)
npx eas build --platform ios --profile preview

# Soumettre à Google Play Store (production)
npx eas submit --platform android
```

### Troubleshooting builds

**Erreur "Not logged in"**
```bash
npx eas login
```

**Build qui échoue**
```bash
# Vérifier les logs détaillés sur :
# https://expo.dev/accounts/[votre-compte]/projects/dropit-mobile/builds
```

**APK trop gros**
- Utilisez le profil `production` qui active Hermes et optimise automatiquement

## 🔧 Configuration réseau

Pour tester sur un appareil physique, assurez-vous que :

1. **L'API est accessible** depuis votre réseau local
2. **Les CORS sont configurés** pour accepter les requêtes mobiles
3. **L'URL de l'API** correspond à votre IP locale si nécessaire

```typescript
// Remplacer localhost par votre IP locale si nécessaire
baseURL: 'http://192.168.1.100:3000',  // Exemple
```

## 🎨 Interface utilisateur

### Écran de connexion
- Design moderne et responsive
- Validation des champs
- Gestion d'erreurs
- État de chargement

### Dashboard
- Navigation intuitive
- Boutons d'action
- Test des packages partagés
- Déconnexion sécurisée

## 🐛 Débogage

### Logs utiles
```typescript
// Connexion réussie
console.log('Login successful:', data.user.email);

// Session trouvée
console.log('Session found:', sessionData.data.user.email);

// Erreur d'authentification
console.error('Login error:', error);
```

### Problèmes courants

1. **Token non envoyé** - Vérifier AsyncStorage et Bearer token
2. **CORS errors** - Configurer `trustedOrigins` dans better-auth
3. **Session expirée** - Implémenter refresh token automatique

## 📚 Ressources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)