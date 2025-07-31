# Guide de Déploiement - DropIt

## Vue d'ensemble

Ce guide documente mon expérience complète de déploiement de l'application DropIt sur un VPS Infomaniak. Il détaille chaque étape réalisée, les décisions prises, et les apprentissages pour monter en compétences DevOps.

**Stack de déploiement :**
- VPS : Infomaniak (Debian Bookworm)
- Domaine : dropit-app.fr (Infomaniak)
- Containers : Docker + Docker Compose
- Reverse Proxy : Traefik avec SSL automatique
- Hébergement : Conteneurs isolés sur réseau privé

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
- Docker et Docker Compose installés

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

**Apprentissage :** Le nom `hostname-infomaniak.infomaniak.ch` dans la réponse ping est normal - c'est le reverse DNS du serveur Infomaniak. L'IP correspond bien au VPS.

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

**Apprentissage :** Dokploy simplifie énormément le déploiement en fournissant une interface graphique pour gérer Docker, les domaines et les certificats SSL. C'est un bon compromis entre simplicité et contrôle pour un projet comme le nôtre.

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

scripts/
├── init-db.sql            # Initialisation PostgreSQL
└── deploy.sh              # Script de déploiement automatisé

./
├── docker-compose.prod.yml   # Orchestration production
└── .env.production.example   # Variables d'environnement exemple
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

### 🔧 Orchestration Docker Compose

#### Architecture réseau

**Réseau isolé :** `dropit-network`
```yaml
networks:
  dropit-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

**Avantages :**
- **Isolation** : Services non accessibles depuis l'extérieur
- **Communication interne** : Résolution DNS automatique (`database`, `api`)
- **Sécurité** : Seuls les ports nécessaires exposés

#### Health checks et dépendances

**PostgreSQL Health Check :**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U dropit -d dropit"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**API avec dépendance :**
```yaml
depends_on:
  database:
    condition: service_healthy  # Attend que PostgreSQL soit prêt
```

#### Labels Traefik pour Dokploy

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.dropit-api.rule=Host(`api.dropit-app.fr`)"
  - "traefik.http.routers.dropit-api.tls=true"
  - "traefik.http.routers.dropit-api.tls.certresolver=letsencrypt"
```

**Intégration Dokploy :**
- **SSL automatique** : Let's Encrypt via Traefik
- **Routing** : `api.dropit-app.fr` → Container API:3000
- **Load balancing** : Prise en charge native

### 🚀 Script de déploiement automatisé

#### Fonctionnalités du script `deploy.sh`

```bash
./scripts/deploy.sh deploy    # Déploiement complet
./scripts/deploy.sh build     # Build des images seulement
./scripts/deploy.sh migrate   # Migrations DB seulement
./scripts/deploy.sh logs api  # Logs en temps réel
```

**Vérifications automatiques :**
1. **Prérequis** : Docker, Docker Compose, fichier `.env.production`
2. **Health checks** : Attente que PostgreSQL et API soient opérationnels
3. **Timeouts** : Échec si services non prêts en 60s
4. **Migrations** : Application automatique des migrations DB

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

### 🌐 Déploiement Frontend React/Vite

#### Décision architecturale : Build statique

**Problématique :** Faut-il dockeriser le frontend ou utiliser du contenu statique ?

**Options évaluées :**

1. **Dockerfile + Nginx personnalisé**
   - ✅ Cohérence avec l'API dockerisée
   - ✅ Contrôle total de la configuration Nginx
   - ✅ Variables d'environnement au runtime
   - ❌ Plus complexe à maintenir
   - ❌ Container qui consomme des ressources H24
   - ❌ Overkill pour du contenu statique

2. **Build statique + Nginx automatique Dokploy** ⭐ **CHOIX RETENU**
   - ✅ Plus simple et rapide à déployer
   - ✅ Moins de ressources serveur consommées
   - ✅ Interface Dokploy dédiée aux sites statiques
   - ✅ Performance optimale pour le contenu statique
   - ✅ Cache CDN plus facile à implémenter
   - ❌ Variables d'environnement limitées au build time

#### Processus de déploiement

**1. Build local avec variables d'environnement**

```bash
# Configuration des variables pour la production
cd apps/web
echo "VITE_API_URL=https://api.dropit-app.fr" > .env.production
echo "VITE_APP_URL=https://dropit-app.fr" >> .env.production

# Build optimisé pour la production
pnpm build

# Vérification du dossier de sortie
ls -la dist/
# Résultat: index.html, assets/, favicon.ico, etc.
```

**2. Configuration Dokploy**

Via l'interface web Dokploy :

1. **Créer un projet** : "DropIt Frontend"
2. **Type de service** : "Static Site"
3. **Configuration** :
   ```
   Source: Upload du dossier dist/
   Domain: dropit-app.fr
   SSL: Activé (Let's Encrypt automatique)
   ```

**3. Nginx automatique**

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

#### Script de déploiement frontend

**Création d'un script dédié :**

```bash
# scripts/deploy-frontend.sh
#!/bin/bash

set -e

log() {
    echo -e "\033[0;34m[FRONTEND]\033[0m $1"
}

success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

# Build du frontend
build_frontend() {
    log "Construction du frontend React/Vite..."
    
    cd apps/web
    
    # Vérification des variables d'environnement
    if [ ! -f ".env.production" ]; then
        error "Fichier .env.production manquant dans apps/web/"
        echo "Créez le fichier avec les variables nécessaires :"
        echo "VITE_API_URL=https://api.dropit-app.fr"
        echo "VITE_APP_URL=https://dropit-app.fr"
        exit 1
    fi
    
    # Installation des dépendances
    pnpm install
    
    # Build de production
    pnpm run build --mode production
    
    # Vérification du build
    if [ ! -d "dist" ]; then
        error "Dossier dist/ non généré"
        exit 1
    fi
    
    success "Frontend buildé avec succès dans apps/web/dist/"
    
    cd ../..
}

# Affichage des instructions Dokploy
show_dokploy_instructions() {
    log "Instructions pour le déploiement sur Dokploy :"
    echo ""
    echo "1. Accéder au dashboard Dokploy : https://dokploy.dropit-app.fr"
    echo "2. Créer un nouveau projet : 'DropIt Frontend'"
    echo "3. Type de service : 'Static Site'"
    echo "4. Configuration :"
    echo "   - Source : Upload du dossier apps/web/dist/"
    echo "   - Domain : dropit-app.fr"
    echo "   - SSL : Activé (Let's Encrypt)"
    echo "5. Déployer"
    echo ""
    success "Le frontend sera accessible sur https://dropit-app.fr"
}

# Fonction principale
main() {
    case "${1:-build}" in
        "build")
            build_frontend
            show_dokploy_instructions
            ;;
        "help"|"--help")
            echo "Usage: $0 [build]"
            echo ""
            echo "Commandes disponibles:"
            echo "  build   - Build le frontend et affiche les instructions Dokploy"
            echo "  help    - Affiche cette aide"
            ;;
        *)
            echo "Commande inconnue: $1"
            echo "Utilisez '$0 help' pour voir les options disponibles"
            exit 1
            ;;
    esac
}

main "$@"
```

#### Bonnes pratiques appliquées

**1. Performance**
- **Chunking automatique** : Vite sépare le code en chunks optimaux
- **Tree shaking** : Code mort éliminé automatiquement
- **Compression** : Gzip/Brotli activé via Nginx Dokploy
- **Cache headers** : Assets avec cache longue durée

**2. Sécurité**
- **Variables d'environnement** : Pas de secrets exposés côté client
- **HTTPS obligatoire** : Redirection automatique
- **Headers sécurisés** : CSP, HSTS configurés par Dokploy

**3. Maintenance**
- **Build reproductible** : Versions figées dans package.json
- **Hot reload local** : `pnpm dev` pour le développement
- **Déploiement simple** : Upload de fichiers via interface

#### Cache Redis (futur)
- **Usage** : Sessions utilisateur, cache queries
- **Image** : `redis:7-alpine`
- **URL interne** : `redis:6379`

#### Recherche Typesense (futur)
- **Usage** : Recherche avancée exercices/athlètes
- **Image** : `typesense/typesense:0.25.2`
- **URL interne** : `typesense:8108`

## Gestion et Maintenance



### Surveillance

Logs dockploy ?

## Sécurité

### Bonnes Pratiques Appliquées

1. **Réseau isolé** : Services dans un réseau Docker privé
2. **Secrets sécurisés** : Variables d'environnement chiffrées avec envx ?
3. **SSL/TLS** : HTTPS obligatoire avec redirection
4. **Firewall** : Seuls les ports 80/443 exposés
5. **Images minimales** : Images Docker optimisées
6. **Non-root** : Containers exécutés avec utilisateur non-privilégié

## Récapitulatif des Choix Techniques

### Frontend : Pourquoi le build statique ?

**Question initiale :** "Faut-il dockeriser le frontend ou utiliser du statique ?"

**Analyse comparative :**

| Critère | Dockerfile + Nginx | Build statique + Dokploy | Gagnant |
|---------|-------------------|--------------------------|---------|
| **Simplicité** | Configuration complexe | Upload de fichiers | 🟢 Statique |
| **Performance** | Container + overhead | Nginx optimisé | 🟢 Statique |
| **Ressources** | RAM/CPU utilisées H24 | Aucune ressource runtime | 🟢 Statique |
| **Maintenance** | Dockerfile + nginx.conf | Aucune config | 🟢 Statique |
| **Cohérence** | Tout dockerisé | Hybride | 🔴 Docker |
| **Contrôle** | Config Nginx custom | Config automatique | 🔴 Docker |
| **Variables env** | Runtime possible | Build-time uniquement | 🔴 Docker |

**Conclusion :** Pour une application React/Vite, le build statique est optimal car :
- Le frontend n'a pas besoin de logique serveur
- Les variables d'environnement sont suffisantes au build-time
- La simplicité prime sur la cohérence architecturale
- Dokploy excelle dans la gestion de sites statiques

### Bénéfices des fichiers Docker créés

**Même avec une approche statique pour le frontend, les fichiers Docker restent utiles :**

1. **`.dockerignore`** : Optimise tous les builds (API, outils, CI/CD)
2. **`init-db.sql`** : Configure PostgreSQL automatiquement
3. **`deploy.sh`** : Tests locaux et debugging
4. **`docker-compose.prod.yml`** : Orchestration complète de l'infrastructure backend

### Architecture finale hybride

**Backend containerisé + Frontend statique = Approche pragmatique**

Cette architecture tire parti du meilleur des deux mondes :
- **Complexité maîtrisée** : Backend dans Docker, frontend simple
- **Performance optimale** : Statique pour le frontend, isolation pour l'API
- **Maintenance réduite** : Moins de configurations à maintenir
- **Évolutivité** : Facile d'ajouter Redis/Typesense en containers

## Next Steps

Après le déploiement initial :
1. ✅ Configurer la surveillance des performances
2. ✅ Mettre en place les backups automatiques
3. ✅ Tester le processus de récupération
4. ✅ Documenter les procédures de maintenance

### Roadmap technique

**Phase 1 - Déploiement initial (en cours)**
- ✅ API NestJS dockerisée
- ✅ PostgreSQL avec optimisations
- 🔄 Frontend statique sur Dokploy

**Phase 2 - Optimisations (à venir)**
- Cache Redis pour les sessions
- Typesense pour la recherche
- Monitoring avec Prometheus/Grafana

**Phase 3 - Automation (futur)**
- CI/CD avec GitHub Actions
- Tests automatisés sur déploiement
- Backups automatiques vers S3