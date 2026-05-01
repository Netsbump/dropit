# Plan de Récupération d'Urgence - DropIt

## Vue d'ensemble

Ce document détaille les procédures de récupération complète en cas de défaillance majeure de l'infrastructure DropIt. Il est conçu pour permettre une restauration rapide et fiable des services critiques.

**Temps de récupération estimé :** 45-60 minutes
**Prérequis :** Accès aux comptes Infomaniak et GitHub

## Scénarios de Récupération

### 🔴 Scénario 1 : Perte complète du VPS

**Symptômes :** VPS inaccessible, services down, impossibilité de se connecter en SSH

#### Étape 1 : Recréation du VPS Infomaniak (10 min)

1. **Manager Infomaniak → VPS → Créer**
   - OS : Debian Bookworm 64bits
   - Configuration : minimum 2GB RAM, 30GB stockage
   - Utilisateur : utilisateur non-root avec sudo

2. **Récupérer la nouvelle IP**
   - Noter l'IP publique du nouveau VPS
   - Tester la connectivité SSH

#### Étape 2 : Configuration DNS (5 min)

**Panel Infomaniak → Domaines → dropit-app.fr → Zone DNS**

```dns
Type: A, Nom: @, Valeur: [NOUVELLE_IP_VPS], TTL: 5 min
Type: A, Nom: api, Valeur: [NOUVELLE_IP_VPS], TTL: 300
Type: A, Nom: dokploy, Valeur: [NOUVELLE_IP_VPS], TTL: 300
```

#### Étape 3 : Configuration Firewall (5 min)

**Panel Infomaniak → VPS → Firewall → Ajouter règles**

```
TCP 22   - SSH
TCP 80   - HTTP (Traefik)
TCP 443  - HTTPS (Traefik)
TCP 3000 - Dashboard Dokploy
ICMP All - Ping
```

#### Étape 4 : Installation Dokploy (10 min)

```bash
# Connexion SSH au nouveau VPS
ssh utilisateur@[NOUVELLE_IP_VPS]

# Installation Dokploy
curl -sSL https://dokploy.com/install.sh | sudo sh

# Vérification installation
docker ps
curl -I http://localhost:3000
```

#### Étape 5 : Recréation des Services (20 min)

**Dashboard Dokploy : http://[NOUVELLE_IP_VPS]:3000**

##### Service PostgreSQL
```
Type: PostgreSQL
Name: dropit-database
Database: dropit
User: dropit
Password: [générer nouveau mot de passe sécurisé]
```

##### Service API
```
Provider: GitHub
Repository: dropit
Branch: main
Build Path: apps/api
Build Type: Dockerfile
Docker File: apps/api/Dockerfile
Domain: api.dropit-app.fr
Container Port: 3000
```

**Variables d'environnement API :**
```env
NODE_ENV=production
DATABASE_HOST=dropit-database
DATABASE_PORT=5432
DATABASE_NAME=dropit
DATABASE_USER=dropit
DATABASE_PASSWORD=[mot_de_passe_postgresql]
BETTER_AUTH_SECRET=[générer avec: openssl rand -base64 32]
BETTER_AUTH_TRUSTED_ORIGINS=https://dropit-app.fr,https://api.dropit-app.fr
API_URL=https://api.dropit-app.fr
```

##### Service Frontend
```
Provider: GitHub
Repository: dropit
Branch: main
Build Path: apps/web
Build Type: Dockerfile
Docker File: apps/web/Dockerfile
Docker Context Path: .
Domain: dropit-app.fr
Container Port: 80
```

#### Étape 6 : Vérification Post-Recovery (5 min)

```bash
# Tests de connectivité
curl -I https://dropit-app.fr
curl -I https://api.dropit-app.fr

# Vérification certificats SSL (doit afficher HTTP/2 200)
curl -I https://dropit-app.fr
curl -I https://api.dropit-app.fr

# Test API health
curl https://api.dropit-app.fr/api/health
```

### 🟡 Scénario 2 : Perte de données Dokploy uniquement

**Symptômes :** VPS accessible, Docker fonctionne, mais services Dokploy corrompus

#### Réinstallation Dokploy sans VPS

```bash
# Arrêt des services existants
sudo docker stop $(sudo docker ps -q)

# Suppression des conteneurs Dokploy
sudo docker system prune -af

# Réinstallation Dokploy
curl -sSL https://dokploy.com/install.sh | sudo sh

# Recréation des services (voir Étape 5 ci-dessus)
```

### 🟢 Scénario 3 : Problème de Service Individuel

**Symptômes :** Un service spécifique ne fonctionne pas

#### Debug rapide
```bash
# Logs du service problématique
sudo docker logs [container_id]

# Logs Traefik
sudo docker logs [traefik_container_id]

# Redéploiement via Dokploy
# Interface Dokploy → Service → Redeploy
```

## Contacts et Accès d'Urgence

### Comptes critiques
- **Infomaniak** : [email/login]
- **GitHub** : Repository dropit
- **Domain** : dropit-app.fr

### Informations de sauvegarde
- **IP VPS actuelle** : 83.228.204.62
- **Dernière configuration fonctionnelle** : [date]
- **Secrets critiques** : Stockés dans [gestionnaire de mots de passe]

## Checklist de Vérification Post-Recovery

- [ ] Services accessibles en HTTPS
- [ ] Certificats SSL générés automatiquement
- [ ] API répond aux endpoints critiques
- [ ] Frontend charge correctement
- [ ] Base de données connectée
- [ ] Logs applicatifs normaux
- [ ] DNS propagé (test depuis plusieurs locations)
- [ ] Firewall correctement configuré
- [ ] Backups programmés si applicable

## Prévention

### Monitoring recommandé
- Surveillance uptime des services principaux
- Alertes en cas de certificat SSL expiré
- Monitoring de l'espace disque VPS
- Tests automatisés des endpoints critiques

### Sauvegarde
- **Configuration Dokploy** : Export régulier des configurations
- **Base de données** : Backup automatique via Dokploy
- **Secrets** : Sauvegarde sécurisée des variables d'environnement

### ⚠️ RGPD : Anonymisation des données de test

**Important :** Si vous restaurez un backup de production dans un environnement non-production (staging, développement local, tests de migration), vous **devez impérativement anonymiser les données personnelles** conformément au RGPD.

**Données à anonymiser :**
- Emails, noms, prénoms, téléphones
- Photos de profil
- Adresses postales et dates de naissance
- Tout identifiant personnel (numéros de licence, etc.)

**Procédure :**
1. Restaurer le backup en environnement de staging
2. Exécuter le script d'anonymisation : `scripts/anonymize-data.sql`
3. Vérifier que les données sensibles sont bien anonymisées avant utilisation

Consultez le guide `docs/data-anonymization-rgpd.md` pour la procedure complete.

## Escalade

**En cas d'échec de récupération :**
1. Vérifier la configuration DNS (propagation 24-48h max)
2. Contrôler les logs détaillés de chaque service
3. Tester la connectivité réseau depuis plusieurs sources
4. Consulter la documentation officielle Dokploy pour les dernières mises à jour
