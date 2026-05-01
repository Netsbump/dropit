# Guide des Migrations en Production

## État actuel

- Les migrations sont versionnées dans `apps/api/src/modules/database/migrations`.
- Le conteneur API applique automatiquement les migrations au démarrage via `pnpm db:migration:up`.
- Le seeding n'est pas lancé automatiquement en production ; il reste optionnel pour les environnements de démo/staging.
- Les seeders sont idempotents et peuvent être relancés sans duplication de données de référence.

## Vue d'ensemble

Ce guide documente les stratégies et bonnes pratiques pour gérer les migrations de base de données en production avec de vraies données utilisateur.

## Exécution des migrations

### Déclenchement automatique

Le Dockerfile de l'API exécute `db:migration:up` au démarrage. Le schéma est donc appliqué de manière traçable, dans l'ordre, via l'historique des migrations.

**Emplacement :** `apps/api/Dockerfile`
```bash
CMD ["sh", "-c", "pnpm db:migration:up && pnpm run start:prod"]
```

### Pourquoi ne pas utiliser `db:sync` en production

- `db:sync` modifie le schéma directement sans historique exploitable
- impossible de relire précisément les changements appliqués sur un environnement
- stratégie de rollback plus fragile qu'avec des migrations explicites

### Validation en CI

Le workflow CI sur `develop` vérifie les migrations :
- `mikro-orm migration:check` : Détecte les erreurs de syntaxe
- `mikro-orm migration:up` : Teste l'application sur une base PostgreSQL de test
- Tests d'intégration : Valident le fonctionnement avec le nouveau schéma

Cette validation garantit que les migrations sont fonctionnelles avant le merge vers `main`.

## Modifications à garder avant production

### 1. Ajouter une gestion d'erreur gracieuse

Pour éviter qu'une migration échouée ne bloque complètement le déploiement, ajouter une stratégie de fallback :

```dockerfile
CMD ["sh", "-c", "pnpm db:migration:up || (echo 'Migration failed, starting with current schema' && exit 1)"]
```

Cela permet à Dokploy de détecter l'échec et de ne pas router le trafic vers la nouvelle version.

### 2. Configurer des backups automatiques et testés

Le point critique restant pour une mise en production robuste est l'automatisation des sauvegardes et la validation régulière des restaurations.

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

- [x] Utiliser `db:migration:up` au démarrage de l'API
- [ ] Configurer les backups automatiques quotidiens (Dokploy ou cron)
- [ ] Tester une procédure de restore complète en environnement de staging
- [ ] Documenter les identifiants et chemins d'accès aux backups
- [ ] Configurer des alertes en cas d'échec de backup (optionnel)

### Avant chaque migration destructive

- [ ] Review de la migration par un pair
- [ ] Test de la migration sur une copie anonymisee de la base de production (voir `docs/data-anonymization-rgpd.md`)
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

## Notes importantes

- **Ne jamais** exécuter `db:sync` en production avec de vraies données
- **Toujours** tester les migrations down (rollback) en local
- **Privilégier** les migrations additives (ajout) plutôt que destructives (suppression)
- **Documenter** les migrations complexes avec des commentaires explicites
- **Communiquer** avec les utilisateurs en cas de maintenance planifiée
