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

### 1. Préparation du Serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo apt install docker-compose-plugin

# Redémarrage pour appliquer les changements
sudo reboot
```

### 2. Configuration DNS

Configurez votre DNS pour pointer vers votre VPS :

```
Type: A
Name: @
Value: [IP_DE_VOTRE_VPS]
TTL: 300

Type: A  
Name: api
Value: [IP_DE_VOTRE_VPS]
TTL: 300
```

### 3. Clonage et Configuration

```bash
# Cloner le repository
git clone [URL_DE_VOTRE_REPO] dropit
cd dropit

# Copier et configurer l'environnement
cp .env.example .env.production
```

### 4. Configuration des Variables d'Environnement

Éditez le fichier `.env.production` :

```bash
# Base
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://dropit:your_secure_password@postgres:5432/dropit
POSTGRES_USER=dropit
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=dropit

# Redis
REDIS_URL=redis://redis:6379

# Typesense
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your_typesense_api_key

# Better Auth
BETTER_AUTH_SECRET=your_very_long_random_secret_here
BETTER_AUTH_TRUSTED_ORIGINS=https://dropit.example.com,https://api.dropit.example.com

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key

# Frontend
VITE_API_URL=https://api.dropit.example.com

# Traefik/Domain
DOMAIN=dropit.example.com
```

### 5. Structure des Fichiers Docker

L'architecture inclut :
- `Dockerfile.api` - Container NestJS
- `Dockerfile.web` - Container frontend statique
- `docker-compose.prod.yml` - Orchestration complète
- `traefik/` - Configuration Traefik

### 6. Déploiement

```bash
# Build et démarrage des services
docker compose -f docker-compose.prod.yml up -d

# Vérification des logs
docker compose -f docker-compose.prod.yml logs -f

# Initialisation de la base de données
docker compose -f docker-compose.prod.yml exec api pnpm db:fresh
```

## Services Déployés

### Frontend (Nginx + Static)
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

### Cache (Redis)
- Port interne: 6379
- Utilisé pour les sessions

### Recherche (Typesense)
- Port interne: 8108
- Index de recherche

### Reverse Proxy (Traefik)
- Ports: 80, 443
- SSL automatique via Let's Encrypt
- Dashboard: `https://traefik.dropit.example.com`

## Gestion et Maintenance

### Commandes Utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f [service]

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart [service]

# Mettre à jour l'application
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Backup de la base de données
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U dropit dropit > backup_$(date +%Y%m%d).sql

# Monitoring des ressources
docker stats
```

### Surveillance

- **Logs centralisés** : Tous les logs sont accessibles via Docker
- **Health Checks** : Vérification automatique de l'état des services
- **Alertes SSL** : Renouvellement automatique via Let's Encrypt

## Sécurité

### Bonnes Pratiques Appliquées

1. **Réseau isolé** : Services dans un réseau Docker privé
2. **Secrets sécurisés** : Variables d'environnement chiffrées
3. **SSL/TLS** : HTTPS obligatoire avec redirection
4. **Firewall** : Seuls les ports 80/443 exposés
5. **Images minimales** : Images Docker optimisées
6. **Non-root** : Containers exécutés avec utilisateur non-privilégié

### Configuration Firewall

```bash
# UFW Configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Troubleshooting

### Problèmes Courants

1. **Certificat SSL non généré**
   ```bash
   # Vérifier les logs Traefik
   docker compose -f docker-compose.prod.yml logs traefik
   ```

2. **Base de données non accessible**
   ```bash
   # Vérifier la connectivité
   docker compose -f docker-compose.prod.yml exec api pnpm db:migration:list
   ```

3. **API non disponible**
   ```bash
   # Vérifier les health checks
   curl https://api.dropit.example.com/api/health
   ```

### Contacts et Support

- **Logs d'erreur** : Consultez `docker compose logs`
- **Monitoring** : Dashboard Traefik pour l'état des services
- **Backups** : Scripts automatiques configurés

---

## Next Steps

Après le déploiement initial :
1. ✅ Configurer la surveillance des performances
2. ✅ Mettre en place les backups automatiques
3. ✅ Tester le processus de récupération
4. ✅ Documenter les procédures de maintenance