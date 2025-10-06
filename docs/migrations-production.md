# Guide des Migrations en Production

## ⚠️ État actuel : Phase de prototypage

**Important :** Le projet est actuellement en phase de prototypage. Aucune migration n'a encore été créée car le schéma de base de données évolue fréquemment. L'application utilise `db:fresh` pour recréer le schéma à la volée avec les seeders.

**Workflow CI actuel :** La vérification des migrations dans la CI est configurée pour être skippée tant qu'aucun fichier de migration n'existe. Cela permet de continuer à itérer rapidement sur le modèle de données sans la contrainte des migrations.

**Action requise avant production :** Lorsque le schéma de données sera stabilisé et prêt pour les premiers utilisateurs réels, il faudra :
1. Créer la migration initiale : `pnpm --filter api db:migration:create --initial`
2. Modifier le Dockerfile pour utiliser `db:migration:up` au lieu de `db:sync` (voir section ci-dessous)
3. Configurer les backups automatiques
4. À partir de là, chaque modification du schéma devra passer par une migration

## Vue d'ensemble

Ce guide documente les stratégies et bonnes pratiques pour gérer les migrations de base de données en production avec de vraies données utilisateur. Actuellement, l'application utilise un système de migrations MikroORM avec exécution automatique au démarrage de l'API.

## État actuel du système

### Configuration actuelle des migrations

**Déclenchement automatique :**
Le Dockerfile de l'API exécute actuellement `db:sync` au démarrage, qui utilise `schema:update --run`. Cette commande force la synchronisation du schéma directement **sans passer par les migrations**, ce qui est acceptable en phase de développement mais impossible en production avec de vraies données.

**Emplacement :** `apps/api/Dockerfile` ligne 55
```bash
CMD ["sh", "-c", "pnpm db:sync && if [ \"$SEED_DB\" = \"true\" ]; then pnpm db:seed:prod; fi && pnpm run start:prod"]
```

### Validation en CI

Le workflow CI sur `develop` vérifie les migrations :
- `mikro-orm migration:check` : Détecte les erreurs de syntaxe
- `mikro-orm migration:up` : Teste l'application sur une base PostgreSQL de test
- Tests d'intégration : Valident le fonctionnement avec le nouveau schéma

Cette validation garantit que les migrations sont fonctionnelles avant le merge vers `main`.

## Modifications à apporter avant la production

### 1. Passer de `db:sync` à `db:migration:up`

**Pourquoi ?**
- `db:sync` (schema:update) modifie directement le schéma sans historique
- `db:migration:up` applique les migrations de manière contrôlée et traçable
- Permet le rollback et la validation progressive

**Modification nécessaire :**

```dockerfile
# Remplacer dans apps/api/Dockerfile ligne 55
CMD ["sh", "-c", "pnpm db:migration:up && if [ \"$SEED_DB\" = \"true\" ]; then pnpm db:seed:prod; fi && pnpm run start:prod"]
```

**Impact :**
- Les migrations s'exécuteront automatiquement au démarrage de chaque nouveau déploiement
- Si une migration échoue, le conteneur ne démarrera pas (protection)
- Dokploy conserve l'ancienne version fonctionnelle disponible pour rollback manuel

### 2. Ajouter une gestion d'erreur gracieuse

Pour éviter qu'une migration échouée ne bloque complètement le déploiement, ajouter une stratégie de fallback :

```dockerfile
CMD ["sh", "-c", "pnpm db:migration:up || (echo 'Migration failed, starting with current schema' && exit 1)"]
```

Cela permet à Dokploy de détecter l'échec et de ne pas router le trafic vers la nouvelle version.

## Stratégies de backup en production

### Backups automatiques quotidiens

**Via Dokploy UI :**
- Interface Dokploy → Service PostgreSQL → Backups
- Configuration de backups automatiques avec rétention (7 jours, 30 jours)
- Stockage sur le VPS ou export vers stockage externe (S3, etc.)
- Backup potentiellement fait pendant une migration (race condition) => donc à réaliser la nuit 

### Backup pré-déploiement automatique

**Script de déploiement personnalisé :**

Créer un script appelé par le webhook Dokploy avant le build :

```bash
#!/bin/bash
# scripts/pre-deploy-backup.sh

BACKUP_DIR="/backups/pre-deploy"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CONTAINER_NAME="dropit-postgres"

echo "Creating pre-deployment backup..."
docker exec $CONTAINER_NAME pg_dump -U postgres dropit | gzip > "$BACKUP_DIR/dropit-pre-deploy-$TIMESTAMP.sql.gz"

# Garder seulement les 10 derniers backups pré-déploiement
ls -t $BACKUP_DIR/dropit-pre-deploy-*.sql.gz | tail -n +11 | xargs rm -f

echo "Backup completed: dropit-pre-deploy-$TIMESTAMP.sql.gz"
```

**Configuration Dokploy :**
- Ajouter ce script comme "Pre-deploy command" dans les paramètres du service API afin de garantir le backup avant changement de schéma et permettre un rollback vers l'état pré-migration

## En résumé

- **Backups quotidiens automatiques** pour la protection générale contre les bugs applicatifs et erreurs humaines
- **Backup pré-déploiement automatique** pour garantir un point de restore immédiatement avant chaque changement de schéma

Cette double couche de sécurité élimine complètement le risque d'oubli et garantit une récupération rapide en cas de problème.

## Workflow de déploiement sécurisé

### 1. Développement local

```bash
# Créer la migration
pnpm --filter api db:migration:create

# Tester l'application
pnpm --filter api db:migration:up

# Vérifier le schéma résultant
pnpm --filter api db:migration:list

# Tester le rollback
pnpm --filter api db:migration:down

# Réappliquer
pnpm --filter api db:migration:up
```

### 2. Pull Request vers develop

- ✅ CI vérifie automatiquement la migration sur PostgreSQL de test
- ✅ Tests d'intégration valident le fonctionnement
- ✅ Review code de la migration par un pair (optionnel)

### 3. Avant merge vers main (production)

**Vérification pré-merge :**

- ✅ Migration testée en local avec up/down
- ✅ CI a validé la migration sur base de test
- ✅ Système de backup automatique configuré (quotidien + pré-déploiement)
- ✅ Review code effectuée si migration destructive

### 4. Déploiement (merge main)

1. **Webhook GitHub → Dokploy**
2. **Dokploy build l'image Docker API**
3. **Nouveau conteneur démarre → `db:migration:up` s'exécute**
4. **Si migration réussit → Conteneur démarre → Health check passe**
5. **Dokploy route le trafic vers la nouvelle version**

### 5. En cas d'échec de migration

**Scénario 1 : Migration échoue, conteneur ne démarre pas**

```bash
# Dokploy détecte le health check failed
# → Le trafic reste sur l'ancienne version (automatique)

# Actions :
# 1. Consulter les logs Dokploy pour identifier l'erreur
# 2. Rollback Dokploy via UI vers version précédente (si nécessaire)
# 3. Fix la migration en local
# 4. Nouveau commit → redéploiement
```

**Scénario 2 : Migration réussit mais données corrompues**

```bash
# 1. Rollback applicatif via Dokploy UI
docker service rollback dropit-api

# 2. Restaurer le backup
docker exec -i dropit-postgres psql -U postgres dropit < /backups/dropit-pre-deploy-XXXXXX.sql.gz

# 3. Vérifier l'état de la base
docker exec dropit-postgres psql -U postgres dropit -c "\dt"

# 4. Redémarrer l'ancienne version
# (Dokploy conserve les anciennes images)
```

**Scénario 3 : Détection tardive (utilisateurs impactés)**

```bash
# 1. Activer le mode maintenance (optionnel)
# Via Dokploy : scale down le service frontend temporairement

# 2. Restore du dernier backup quotidien
docker exec -i dropit-postgres psql -U postgres dropit < /backups/dropit-YYYYMMDD.sql.gz

# 3. Évaluer la perte de données
# Données entre le backup et maintenant = perdues
# → Communication aux utilisateurs si nécessaire

# 4. Rollback applicatif vers version stable

# 5. Post-mortem : analyser la cause racine
```

## Checklist de mise en production

### Avant les premiers utilisateurs réels

- [ ] Modifier le Dockerfile pour utiliser `db:migration:up` au lieu de `db:sync`
- [ ] Configurer les backups automatiques quotidiens (Dokploy ou cron)
- [ ] Tester une procédure de restore complète en environnement de staging
- [ ] Documenter les identifiants et chemins d'accès aux backups
- [ ] Configurer des alertes en cas d'échec de backup (optionnel)

### Avant chaque migration destructive

- [ ] Review de la migration par un pair
- [ ] Test de la migration sur une copie anonymisée de la base de production (voir section RGPD)
- [ ] Plan de rollback documenté et validé
- [ ] Communication aux utilisateurs si downtime nécessaire

### Après chaque déploiement avec migration

- [ ] Vérifier les logs Dokploy pour confirmation de migration réussie
- [ ] Tester manuellement les fonctionnalités impactées par le changement de schéma
- [ ] Surveiller les erreurs Sentry/logs applicatifs pendant 1h
- [ ] Vérifier l'intégrité des données critiques (queries de validation)

### Documentation externe

- [MikroORM Migrations](https://mikro-orm.io/docs/migrations)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup.html)
- [Dokploy Backup Configuration](https://docs.dokploy.com/)
- [Zero-downtime database migrations](https://fly.io/ruby-dispatch/zero-downtime-migrations/)

## Conformité RGPD et anonymisation des données

### ⚠️ Important : Test avec données de production

Lorsque vous testez une migration critique sur une copie de la base de production, vous **devez impérativement anonymiser les données personnelles** conformément au RGPD avant de les utiliser dans un environnement non-production (staging, développement local).

### Données à anonymiser

**Données personnelles identifiantes :**
- Emails utilisateurs
- Noms et prénoms
- Numéros de téléphone
- Adresses postales
- Dates de naissance exactes
- Tout identifiant externe (numéros de licence sportive, etc.)

**Données sensibles :**
- Photos de profil (supprimer ou remplacer par des avatars génériques)
- Notes personnelles ou commentaires contenant des informations privées
- Historique de connexion avec adresses IP

### Procédure d'anonymisation

**1. Créer un backup de production**
```bash
ssh user@dropit-app.fr
docker exec dropit-postgres pg_dump -U postgres dropit | gzip > /tmp/prod-backup-$(date +%Y%m%d).sql.gz
```

**2. Restaurer en environnement de staging**
```bash
# Sur le serveur de staging ou en local
gunzip -c prod-backup-YYYYMMDD.sql.gz | docker exec -i staging-postgres psql -U postgres dropit_staging
```

**3. Exécuter le script d'anonymisation**
```bash
# Utiliser le script fourni
docker exec -i staging-postgres psql -U postgres dropit_staging < scripts/anonymize-data.sql
```

Consultez le script `scripts/anonymize-data.sql` pour les détails de l'anonymisation appliquée.

### Conservation des données anonymisées

- ✅ Les données anonymisées peuvent être conservées en staging sans limite de durée
- ✅ Peuvent être partagées avec des développeurs ou testeurs
- ❌ Ne jamais utiliser de données de production brutes hors de l'environnement de production
- ❌ Ne jamais commiter de dumps contenant des données réelles dans Git

## Notes importantes

- **Ne jamais** exécuter `db:sync` en production avec de vraies données
- **Ne jamais** utiliser de données de production non-anonymisées hors production (RGPD)
- **Toujours** tester les migrations down (rollback) en local
- **Privilégier** les migrations additives (ajout) plutôt que destructives (suppression)
- **Documenter** les migrations complexes avec des commentaires explicites
- **Communiquer** avec les utilisateurs en cas de maintenance planifiée
