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
│  └─────────┬──────────────────▲─────────────────────┬─────┘  │
│            │                  │                     │        │
│  ┌─────────▼─────────┐  ┌───── ─────────────┐  ┌────▼──────┐ │
│  │ DOKPLOY DASHBOARD │  │  DOCKER SWARM     │  │  PROJET   │ │
│  │ (Interface admin) │◄►│ (Orchestrateur)   │◄►│  DROPIT   │ │
│  │      :3000        │  │                   │  │ (Docker   │ │
│  │                   │  │                   │  │ Network)  │ │
│  │                   │  │                   │  │           │ │
│  │                   │  │                   │  │┌─────────┐│ │
│  │                   │  │                   │  ││Frontend ││ │
│  │                   │  │                   │  ││(Nginx + ││ │
│  │                   │  │                   │  ││ Static) ││ │
│  │                   │  │                   │  ││dropit-  ││ │
│  │                   │  │                   │  ││app.fr   ││ │
│  │                   │  │                   │  │└─────────┘│ │
│  │                   │  │                   │  │┌─────────┐│ │
│  │                   │  │                   │  ││  API    ││ │
│  │                   │  │                   │  ││ :3000   ││ │
│  │                   │  │                   │  ││api.     ││ │
│  │                   │  │                   │  ││dropit-  ││ │
│  │                   │  │                   │  ││app.fr   ││ │
│  │                   │  │                   │  │└─────────┘│ │
│  │                   │  │                   │  │┌─────────┐│ │
│  │                   │  │                   │  ││PostgreSQL│ │
│  │                   │  │                   │  ││ :5432   ││ │
│  │                   │  │                   │  ││(interne)││ │
│  │                   │  │                   │  │└─────────┘│ │
│  └───────────────────┘  └───────────────────┘  └───────────┘ │
└──────────────────────────────────────────────────────────────┘

Flux de données:
• Dokploy Dashboard ←→ Docker Swarm (gestion via API)
  - Dashboard → Swarm : création/suppression de services, déploiements, configurations
  - Swarm → Dashboard : statut des services, logs, métriques, événements
• Docker Swarm → Traefik (configuration dynamique des routes)
• Docker Swarm ←→ Projet DropIt (orchestration bidirectionnelle)
  - Swarm → DropIt : déploiement, mise à jour, redémarrage des conteneurs
  - DropIt → Swarm : health checks, logs, métriques, état des services
• Traefik → Projet DropIt (routage des requêtes HTTP en temps réel)

Routes Traefik:
• dropit-app.fr               → Frontend (static)
• api.dropit-app.fr           → API:3000
• http://83.228.204.62:3000/  → Dashboard Dokploy:3000
• traefik.dropit-app.fr       → Dashboard Traefik (avec auth)
```

## Comprendre l'Infrastructure

### Dokploy : La Solution d'Orchestration

Dokploy est une plateforme open-source qui transforme un VPS en environnement de déploiement moderne, similaire à Vercel ou Netlify mais hébergé sur votre propre serveur. L'installation de Dokploy configure automatiquement Docker Swarm comme orchestrateur de conteneurs et déploie Traefik comme reverse proxy, créant un environnement complet et fonctionnel en une seule commande.

Concrètement, Dokploy fonctionne comme une image Docker d'administration qui s'exécute sur le port 3000 du serveur. Cette interface web permet de gérer les déploiements, déclencher des builds, configurer les domaines et surveiller les services sans jamais toucher à la ligne de commande. Chaque action effectuée via l'interface génère automatiquement les configurations appropriées dans Traefik pour le routage des requêtes et dans Docker Swarm pour l'orchestration des conteneurs.

### L'Architecture sous le Capot

Docker Swarm, configuré automatiquement par Dokploy, orchestre tous les conteneurs sur le serveur. Il s'occupe du déploiement, de la surveillance et du redémarrage automatique des services en cas de défaillance, tout en permettant l'isolement des projets grâce aux réseaux Docker séparés.

Traefik agit comme un pont intelligent entre l'extérieur et les conteneurs internes. Connecté aux ports 80 et 443 du VPS ainsi qu'aux réseaux internes de chaque projet, il reçoit les requêtes externes et les route vers les bons services. Quand une requête arrive sur `api.dropit-app.fr`, Traefik consulte automatiquement ses règles de routage (générées par Dokploy) et transmet la demande au conteneur API dans le réseau isolé du projet DropIt, tout en gérant la terminaison SSL de manière transparente.

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
- Panel Infomaniak → Web & Domaines → Domaines → dropit-app.fr → Zone DNS

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

### 3. Configuration du Firewall Infomaniak ✅

**Problème critique :** Par défaut, le firewall Infomaniak bloque la plupart des ports. Dokploy et les applications web ont besoin de ports spécifiques pour fonctionner correctement, notamment pour permettre à Let's Encrypt de valider les domaines et générer les certificats SSL.

#### Ports nécessaires à ouvrir

**Accès à l'interface :**
1. **Panel Infomaniak → VPS → Firewall**
2. **Ajouter les règles suivantes :**

```
Type: TCP, Port: 22, Source: Toutes les IP
Description: SSH (déjà présent par défaut)

Type: TCP, Port: 80, Source: Toutes les IP
Description: HTTP (Traefik - sites web)

Type: TCP, Port: 443, Source: Toutes les IP
Description: HTTPS (Traefik - sites web SSL)

Type: TCP, Port: 3000, Source: Toutes les IP
Description: Dashboard Dokploy

Type: ICMP, Port: (tous), Source: Toutes les IP
Description: Ping (déjà présent par défaut)
```

#### Pourquoi ces ports sont critiques

- **Port 80** : Traefik reçoit le trafic HTTP et gère les redirections HTTPS. Let's Encrypt utilise ce port pour valider les domaines lors de la génération des certificats SSL.
- **Port 443** : Traefik gère le trafic HTTPS avec certificats SSL automatiques
- **Port 3000** : Interface d'administration Dokploy accessible depuis l'extérieur
- **Ports 22 et ICMP** : SSH et ping (généralement déjà configurés)

**Sans les ports 80 et 443**, vous obtiendrez des erreurs ACME dans les logs Traefik et vos sites web ne seront pas accessibles publiquement.

#### Vérification firewall

Une fois les règles ajoutées, testez la connectivité :

```bash
# Test depuis votre machine locale
curl -I http://[IP_VPS]        # Doit répondre (Traefik)
curl -I http://[IP_VPS]:3000   # Doit répondre (Dokploy)
```

### 4. Configuration du Déploiement DropIt

#### API NestJS

1. 🐳 Dockerisation de l'API via Multi-stage Dockerfile

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

#### Architecture du Dockerfile

Le Dockerfile suit une approche multi-stage qui sépare clairement les phases de construction et d'exécution. Cette stratégie permet d'optimiser à la fois les temps de build et la taille de l'image finale tout en maintenant une sécurité appropriée pour la production.

La première étape établit une base commune avec Node.js 20 sur Alpine Linux et configure pnpm avec la version exacte spécifiée dans le projet. Cette fondation est réutilisée par les étapes suivantes pour garantir la cohérence de l'environnement.

L'étape de construction récupère d'abord uniquement les fichiers de verrouillage des dépendances, ce qui permet à Docker de mettre en cache cette couche tant que les versions des packages ne changent pas. Une fois les dépendances téléchargées, le code source complet est copié et l'application est compilée. Le système build tous les packages du monorepo nécessaires à l'API grâce au filtre pnpm, puis utilise la commande `pnpm deploy` pour créer une structure de production épurée contenant uniquement les fichiers et dépendances nécessaires à l'exécution.

La dernière étape produit l'image finale en copiant uniquement les artefacts de production depuis l'étape de construction. L'image résultante ne contient ni les outils de développement ni le code source TypeScript, seulement le JavaScript compilé et les dépendances runtime. La configuration MikroORM est adaptée pour fonctionner avec les fichiers JavaScript compilés plutôt qu'avec TypeScript, et l'application démarre en synchronisant automatiquement le schéma de base de données avant de lancer le serveur.

**Gestion des données de démonstration :** Le Dockerfile intègre un système de seeding conditionnel via la variable d'environnement `SEED_DB`. Quand cette variable est définie à `true`, l'application exécute automatiquement les seeders MikroORM pour peupler la base de données avec des données de démonstration. Cette fonctionnalité est particulièrement utile pour les environnements de staging ou de démonstration client, tout en restant désactivée par défaut en production pour éviter la pollution des données réelles.

#### 🐘 Base de Données PostgreSQL

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

#### 🌐 Frontend React (Vite)

**Problématique initiale :** Les solutions de build automatisé comme Nixpacks utilisent npm par défaut et ne supportent pas les références `workspace:*` des monorepos pnpm. Cette incompatibilité provoque des erreurs de build (`EUNSUPPORTEDPROTOCOL`) empêchant le déploiement du frontend.

**Solution retenue :** Dockerfile multi-stage avec configuration Nginx externalisée

Le Dockerfile suit une architecture en trois étapes inspirée des bonnes pratiques utilisées par l'équipe de développement sur des projets similaires. La première étape configure l'environnement Node.js 20 avec pnpm activé via corepack. La deuxième étape reproduit fidèlement la structure du monorepo en copiant sélectivement les packages nécessaires (@dropit/contract, @dropit/schemas, @dropit/permissions, @dropit/i18n) puis exécute un build récursif avec mise en cache pnpm pour optimiser les temps de reconstruction. La troisième étape utilise une image Nginx alpine minimaliste qui copie uniquement les assets buildés et applique une configuration personnalisée pour gérer le routage côté client des applications Single Page.

**Architecture des fichiers :**

```
apps/web/Dockerfile          # Build multi-stage du frontend
nginx/nginx.conf             # Configuration Nginx pour SPA
```

La configuration Nginx est externalisée dans un fichier dédié plutôt qu'intégrée au Dockerfile. Cette séparation facilite les ajustements de configuration sans rebuild de l'image et respecte le principe de responsabilité unique. Le fichier `nginx.conf` configure le fallback SPA essentiel pour React Router, dirigeant toutes les routes non-fichier vers `index.html` afin que le routage côté client puisse prendre le relais.

**Configuration Dokploy détaillée :**

```
Provider: GitHub
Repository: dropit
Branch: develop
Build Path: apps/web
Trigger Type: On Push

Build Type: Dockerfile
Docker File: apps/web/Dockerfile
Docker Context Path: .
Docker Build Stage: (laisser vide)

Domain: dropit-app.fr
SSL: Automatique via Let's Encrypt
Container Port: 80
```

**Points critiques pour le recovery :**
- **Docker Context Path = `.`** (racine) : essentiel car le Dockerfile référence `./nginx/nginx.conf` depuis la racine du repository
- **Container Port = 80** : Nginx écoute sur le port 80 dans le conteneur
- **Build Path = apps/web** : limite le build trigger aux modifications du frontend
- **Docker Build Stage vide** : Dokploy utilise automatiquement le dernier stage (`runner`) du Dockerfile multi-stage

Cette configuration garantit que le build s'exécute dans le bon contexte avec accès à tous les fichiers nécessaires du monorepo, tout en optimisant les déclenchements de build pour éviter les reconstructions inutiles.



---

## Ressources Complémentaires

- **[Plan de Récupération d'Urgence](./emergency-recovery.md)** : Procédures complètes de restauration en cas de défaillance majeure
- **Guide de Dépannage** : Solutions aux problèmes courants (à créer)
- **Monitoring et Alertes** : Configuration de la surveillance des services (à créer)

---

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
