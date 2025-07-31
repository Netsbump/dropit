# Guide de Déploiement - DropIt

## Vue d'ensemble

Ce guide documente mon expérience complète de déploiement de l'application DropIt sur un VPS Infomaniak. Il détaille chaque étape réalisée, les décisions prises, et les apprentissages pour monter en compétences DevOps.

**Stack de déploiement :**
- VPS : Infomaniak (Debian Bookworm)
- Domaine : dropit-app.fr (Infomaniak)
- Containers : Docker + Docker Swarm (Dokploy auto)
- Reverse Proxy : Traefik avec SSL automatique

## Architecture de Déploiement

```
User (navigateur) 
    ↓
dropit-app.fr → DNS → [IP_DU_VPS]
    ↓
┌──────────────────────────────────────────────────────────────┐
│                        VPS INFOMANIAK                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              TRAEFIK (Reverse Proxy)                   │  │
│  │                    :80, :443                           │  │
│  │              + SSL automatique                         │  │
│  └─────────────┬──────────────────┬───────────────────────┘  │
│                │                  │                          │
│  ┌─────────────▼──────────────────▼────────────────────────┐ │
│  │              DOCKER NETWORK: dropit-network             │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │  Frontend   │  │     API      │  │  PostgreSQL    │  │ │
│  │  │   (Nginx)   │  │  (Node.js)   │  │   (Database)   │  │ │
│  │  │    :80      │  │    :3000     │  │    :5432       │  │ │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌──────────────┐                      │ │
│  │  │    Redis    │  │  Typesense   │                      │ │
│  │  │   (Cache)   │  │  (Search)    │                      │ │
│  │  │    :6379    │  │    :8108     │                      │ │
│  │  └─────────────┘  └──────────────┘                      │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Routes Traefik:
• dropit-app.fr           → Frontend:80
• api.dropit-app.fr       → API:3000  
• traefik.dropit-app.fr   → Dashboard Traefik (avec auth)
```

## Prérequis

### Sur le VPS
- Debian bookworm 64bits
- Profil utilisateur non root mais avec sudo
- Dokploy installé (installe automatiquement docker, docker swarm, redis, postgres, etc)

### Nom de domaine et DNS

**Domaine choisi :** `dropit-app.fr` chez Infomaniak

**Décisions prises :**
- ✅ Domaine de base uniquement (pas de DNS Fast Anycast ni Domain Privacy pour commencer)
- ✅ Adresse email `admin@dropit-app.fr` (pour notifications SSL, etc.)
- ❌ Page web basique Infomaniak (inutile, j'ai mon propre frontend)

**Configuration DNS réalisée :**

#### 1. Accès à la zone DNS
- Panel Infomaniak → Manager Web → Domaines → dropit-app.fr → Zone DNS

#### 2. Enregistrements DNS ajoutés/modifiés

**IP VPS obtenue :** `[IP_DU_VPS]` (récupérée dans le panel Infomaniak)

```dns
# Domaine principal (modifié)
Type: A
Nom: @  
Valeur: [IP_DU_VPS]
TTL: 5 min

# Sous-domaine API (ajouté)
Type: A
Nom: api
Valeur: [IP_DU_VPS]  
TTL: 300

# Dashboard Traefik (ajouté)
Type: A
Nom: traefik
Valeur: [IP_DU_VPS]
TTL: 300
```

**Enregistrements conservés :**
- `NS` (serveurs DNS Infomaniak)
- `MX` (emails via Infomaniak)  
- `TXT` (DKIM/SPF pour emails)

#### 3. Vérification DNS

```bash
# Test de résolution DNS
ping dropit-app.fr
# Résultat: [IP_DU_VPS] (hostname-infomaniak.infomaniak.ch)

ping api.dropit-app.fr  
ping traefik.dropit-app.fr
```

Le nom `hostname-infomaniak.infomaniak.ch` dans la réponse ping est normal - c'est le reverse DNS du serveur Infomaniak. L'IP correspond bien au VPS.

## Étapes de Déploiement

### 1. Préparation du Serveur ✅

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de Dokploy ✅

**Qu'est-ce que Dokploy ?**

Dokploy est une plateforme open-source de gestion de conteneurs Docker et d'applications sur serveur. C'est une alternative self-hosted à des solutions comme Vercel ou Netlify, permettant de déployer facilement des applications web avec un interface graphique.

**Avantages pour ce projet :**
- Interface web intuitive pour gérer les déploiements
- Support natif de Docker et Docker Compose
- Reverse proxy Traefik intégré avec SSL automatique
- Monitoring des applications
- Gestion des domaines et certificats SSL/TLS
- Backups automatiques

#### Prérequis système

**Configuration serveur minimale :**
- RAM : 2 GB minimum (recommandé pour la stabilité)
- Stockage : 30 GB minimum (espace pour OS + conteneurs + données)
- OS : Debian Bookworm (✅ compatible)
- Utilisateur : accès sudo (✅ déjà configuré)

**Ports utilisés :**
- Port 3000 : Dashboard Dokploy (interface d'administration) 
- Port 80/443 : Traefik (proxy intégré, géré automatiquement)

#### Installation

**Commande d'installation officielle :**

```bash
# Installation en une seule commande (nécessite les droits root)
curl -sSL https://dokploy.com/install.sh | sudo sh
```

**Ce que fait le script :**
1. Installe Docker et Docker Compose si non présents
2. Télécharge et configure Dokploy
3. Démarre les services nécessaires
4. Configure le reverse proxy Traefik

**Temps d'installation estimé :** 2-5 minutes selon la connexion

#### Accès au dashboard

Une fois l'installation terminée :

1. **Accéder à l'interface :**
   ```
   http://[IP_DU_VPS]:3000
   ```
   
2. **Création du compte administrateur :**
   - Premier accès : création automatique du compte admin
   - Choisir un mot de passe fort
   - L'interface sera accessible uniquement avec ces identifiants

3. **Sécurisation (optionnel) :**
   - Configurer un sous-domaine dédié : `dokploy.dropit-app.fr`
   - Activer HTTPS via Traefik
   - Restreindre l'accès par IP si nécessaire

Dokploy simplifie énormément le déploiement en fournissant une interface graphique pour gérer Docker, les domaines et les certificats SSL. C'est un bon compromis entre simplicité et contrôle pour un projet comme le nôtre.

#### Résolution des problèmes rencontrés

**Problème 1 : Limites de téléchargement Docker Hub**
- **Erreur** : `toomanyrequests: You have reached your unauthenticated pull rate limit`
- **Solution** : Créer un compte Docker Hub gratuit et se connecter avec `sudo docker login`
- **Apprentissage** : Les comptes gratuits ont 200 pulls/6h vs 100 pour les anonymes

**Problème 2 : Port 3000 inaccessible depuis internet**
- **Cause** : Firewall Infomaniak bloque le port par défaut
- **Solution** : Panel Infomaniak → VPS → Firewall → Ajouter règle TCP port 3000
- **Apprentissage** : Toujours vérifier les firewalls cloud en plus du firewall système

#### Installation réussie

**Services installés et fonctionnels :**
- ✅ Docker Engine + Docker Swarm
- ✅ PostgreSQL 16 (base de données Dokploy)
- ✅ Redis 7 (cache et sessions)
- ✅ Traefik v3.1.2 (reverse proxy)
- ✅ Dokploy (interface de gestion)

**Accès au dashboard :**
- **URL temporaire** : http://83.228.204.62:3000
- **Compte admin** : Créé avec succès
- **Sous-domaine configuré** : dokploy.dropit-app.fr (DNS propagé)

**Note de sécurité :** Le dashboard Dokploy est actuellement accessible en HTTP. La configuration HTTPS sera ajoutée ultérieurement pour sécuriser l'interface d'administration.

### 3. Configuration du Déploiement DropIt

*Cette section sera complétée lors du déploiement de l'application.*

## Services à déployer

Cette section détaille la dockerisation des services DropIt et les choix techniques effectués pour optimiser le déploiement sur Dokploy.

### 🐳 Dockerisation de l'API NestJS

#### Choix d'architecture : Multi-stage Dockerfile

**Décision technique :** Utilisation d'un Dockerfile multi-stage pour optimiser la taille finale et la sécurité.

**Pourquoi cette approche ?**
- **Stage 1 (builder)** : Contient tous les outils de build (TypeScript, devDependencies)
- **Stage 2 (runner)** : Image de production minimale, sans outils de développement
- **Réduction de taille** : ~800MB → ~200MB (gain de 75%)
- **Sécurité** : Pas d'outils de build en production

#### Image de base : Node.js 20 Alpine

**Avantages de Alpine Linux :**
- **Légèreté** : 5MB vs 100MB+ pour Ubuntu
- **Sécurité** : Surface d'attaque réduite
- **Performance** : Démarrage plus rapide

#### Optimisations implémentées

**1. Cache pnpm optimisé**
```dockerfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
```
- **BuildKit cache mount** : réutilise le cache entre builds
- **Gain de temps** : 2-3 minutes → 30 secondes sur rebuild

**2. Utilisateur non-root**
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs
```
- **Sécurité** : Principe du moindre privilège
- **Conformité** : Standards de sécurité container

**3. dumb-init pour la gestion des signaux**
```dockerfile
ENTRYPOINT ["dumb-init", "--"]
```
- **Problème résolu** : Gestion propre des signaux SIGTERM/SIGINT
- **Bénéfice** : Arrêt gracieux des containers

**4. Health check intégré**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health'...)"
```
- **Monitoring** : Docker/Dokploy peut détecter les échecs
- **Auto-healing** : Redémarrage automatique si l'API ne répond plus

#### Structure des fichiers créés

```
apps/api/
├── Dockerfile              # Configuration Docker multi-stage
├── .dockerignore           # Exclusions pour optimiser le contexte
└── [code existant]
```

### 🐘 Base de Données PostgreSQL

#### Configuration production

**Image choisie :** `postgres:16-alpine`
- **Version stable** : PostgreSQL 16 (dernière LTS)
- **Légèreté** : Variante Alpine pour réduire la taille

**Optimisations appliquées :**
```sql
-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Cryptographie

-- Paramètres de performance
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

**Persistance des données :**
```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/postgres  # Stockage local pour Dokploy
```

### 🎯 Approche Services Séparés (Dokploy)

1. **PostgreSQL** : Service natif Dokploy 
2. **API NestJS** : Service Docker 
3. **Frontend** : Site statique

**Avantages :**
- **Simplicité** : Chaque service géré indépendamment
- **Stabilité** : Pas de rate limits, services Dokploy optimisés
- **Debug facile** : Logs et monitoring par service
- **Scaling** : Possibilité de scaler individuellement

### 🛠️ Déploiement sur Dokploy

**Étapes de déploiement :**
1. **PostgreSQL** : Création du service base de données
2. **API** : Service Docker simple avec Dockerfile
3. **Frontend** : Site statique 
4. **Domaines** : Configuration SSL automatique

## TODO : Reprise du déploiement

**Prochaines étapes à réaliser :**

### 1. Créer service PostgreSQL natif sur Dokploy ✅ PRIORITÉ HAUTE
- Utiliser le service PostgreSQL intégré de Dokploy
- Configurer : DB_NAME=dropit, DB_USER=dropit, DB_PASSWORD=[généré]
- Noter les infos de connexion pour l'API

### 2. Créer service API simple (sans compose) sur Dokploy ✅ PRIORITÉ HAUTE  
- Type : Docker
- Repository : github.com/Netsbump/dropit.git
- Branch : main (ou develop selon workflow choisi)
- Dockerfile : apps/api/Dockerfile
- Variables d'environnement : DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, etc.
- Domain : api.dropit-app.fr

### 3. Créer le projet Frontend statique sur Dokploy ✅ PRIORITÉ MOYENNE
- Type : Static Site
- Build du frontend en local : cd apps/web && pnpm build
- Upload du dossier dist/
- Domain : dropit-app.fr

### 4. Configurer les domaines et SSL ✅ PRIORITÉ MOYENNE
- Vérifier DNS : dropit-app.fr, api.dropit-app.fr
- Activer SSL automatique Let's Encrypt
- Tester les connexions HTTPS

### 5. Tests et vérifications finales ✅ PRIORITÉ BASSE
- API health check : https://api.dropit-app.fr/api/health
- Frontend accessible : https://dropit-app.fr  
- Base de données connectée
- Migrations appliquées

### 📋 Variables d'environnement

#### Structure `.env.production`

**Sécurité :**
- **Secrets** : Générés avec `openssl rand -base64 32`
- **URLs** : Configuration dynamique selon l'environnement
- **CORS** : Origins strictement définies

**Catégories :**
- **Base de données** : Connexion PostgreSQL
- **Authentication** : Better-auth configuration
- **Email** : Intégration Brevo
- **URLs** : Frontend/API endpoints

### 🔍 Services suivants (pas encore implémentés)

#### Frontend (React + Vite) ✅
- **Choix retenu** : Build statique avec Nginx automatique via Dokploy
- **Approche** : Simplicité et performance optimales
- **URL cible** : `https://dropit-app.fr`

#### Processus de déploiement


**1. Configuration Dokploy**

Via l'interface web Dokploy :

1. **Créer un projet** : "DropIt Frontend"
2. **Type de service** : "Static Site"
3. **Configuration** :
   ```
   Source: Upload du dossier dist/
   Domain: dropit-app.fr
   SSL: Activé (Let's Encrypt automatique)
   ```

**2. Nginx automatique**

Dokploy configure automatiquement :
- **Serveur Nginx** pour servir les fichiers statiques
- **Compression Gzip** pour optimiser les performances
- **Cache headers** pour les assets (CSS, JS, images)
- **Redirection HTTPS** automatique
- **Fallback SPA** : toutes les routes → index.html

#### Variables d'environnement build-time

**Gestion avec Vite :**

```bash
# .env.production (dans apps/web/)
VITE_API_URL=https://api.dropit-app.fr
VITE_APP_URL=https://dropit-app.fr
VITE_AUTH_REDIRECT_URL=https://dropit-app.fr/auth/callback
VITE_BETTER_AUTH_BASE_PATH=https://api.dropit-app.fr/api/auth
```

**Utilisation dans le code :**

```typescript
// Configuration API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Configuration better-auth
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_PATH,
  // ...
})
```

#### Architecture de déploiement mise à jour

```
User (navigateur) 
    ↓
dropit-app.fr → DNS → [IP_DU_VPS]
    ↓
┌──────────────────────────────────────────────────────────────┐
│                        VPS INFOMANIAK                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              TRAEFIK (Reverse Proxy)                   │  │
│  │                    :80, :443                           │  │
│  │              + SSL automatique                         │  │
│  └─────────────┬──────────────────┬───────────────────────┘  │
│                │                  │                          │
│  ┌─────────────▼────────────┐   ┌─▼────────────────────────┐ │
│  │     FRONTEND STATIQUE    │   │    DOCKER NETWORK        │ │
│  │       (Nginx Dokploy)    │   │    dropit-network        │ │
│  │      React/Vite Build    │   │                          │ │
│  │                          │   │  ┌──────────────────────┐ │ │
│  └──────────────────────────┘   │  │     API (NestJS)     │ │ │
│                                 │  │       :3000          │ │ │
│                                 │  └──────────────────────┘ │ │
│                                 │                          │ │
│                                 │  ┌──────────────────────┐ │ │
│                                 │  │   PostgreSQL DB     │ │ │
│                                 │  │       :5432          │ │ │
│                                 │  └──────────────────────┘ │ │
│                                 └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Routes Traefik finales:
• dropit-app.fr           → Frontend statique (Nginx Dokploy)
• api.dropit-app.fr       → API Container:3000
• dokploy.dropit-app.fr   → Dashboard Dokploy
```

#### Cache Redis (futur)
- **Usage** : Sessions utilisateur, cache queries
- **Image** : `redis:7-alpine`
- **URL interne** : `redis:6379`

#### Recherche Typesense (futur)
- **Usage** : Recherche avancée exercices/athlètes
- **Image** : `typesense/typesense:0.25.2`
- **URL interne** : `typesense:8108`

## Gestion et Maintenance

Panel Admin Dokploy

### Surveillance

Logs dockploy 

## Sécurité

### Bonnes Pratiques Appliquées

1. **Réseau isolé** : Services dans un réseau Docker privé
2. **Secrets sécurisés** : Variables d'environnement
3. **SSL/TLS** : HTTPS obligatoire avec redirection
4. **Firewall** : Seuls les ports 80/443 exposés
5. **Images minimales** : Images Docker optimisées
6. **Non-root** : Containers exécutés avec utilisateur non-privilégié

### Bénéfices des fichiers Docker créés

**Même avec une approche statique pour le frontend, les fichiers Docker restent utiles :**

1. **`.dockerignore`** : Optimise tous les builds (API, outils, CI/CD)
2. **`init-db.sql`** : Configure PostgreSQL automatiquement

## Next Steps

Après le déploiement initial :
1. ✅ Configurer la surveillance des performances
2. ✅ Mettre en place les backups automatiques
3. ✅ Tester le processus de récupération
4. ✅ Documenter les procédures de maintenance
