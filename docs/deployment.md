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

### Frontend (Nginx + Static) => ou dockerfile ? c'est quoi le mieux 
- URL: `https://dropit.example.com`
- Port interne: 80
- Contenu: Build statique Vite

### API (NestJS)
- URL: `https://api.dropit.example.com`
- Port interne: 3000
- Healthcheck: `/api/health`

### Base de Données (PostgreSQL)
- Port interne: 5432
- Volumes persistants
- Backups automatiques

### Cache (Redis) => pas tout de suite
- Port interne: 6379
- Utilisé pour les sessions

### Recherche (Typesense)  => pas tout de suite
- Port interne: 8108
- Index de recherche

### Reverse Proxy (Traefik) => natif sur dockploy
- Ports: 80, 443
- SSL automatique via Let's Encrypt
- Dashboard: `https://traefik.dropit.example.com`

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

## Next Steps

Après le déploiement initial :
1. ✅ Configurer la surveillance des performances
2. ✅ Mettre en place les backups automatiques
3. ✅ Tester le processus de récupération
4. ✅ Documenter les procédures de maintenance