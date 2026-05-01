# Anonymisation des donnees de production (RGPD)

Ce document decrit la procedure pour anonymiser une copie de base de donnees de production avant usage en environnement non-production (staging, developpement local, tests de migration).

## Important

Lorsque vous testez une migration critique sur une copie de la base de production, vous devez imperativement anonymiser les donnees personnelles conformement au RGPD.

## Donnees a anonymiser

**Donnees personnelles identifiantes :**
- Emails utilisateurs
- Noms et prenoms
- Numeros de telephone
- Adresses postales
- Dates de naissance exactes
- Tout identifiant externe (numeros de licence sportive, etc.)

**Donnees sensibles :**
- Photos de profil (supprimer ou remplacer par des avatars generiques)
- Notes personnelles ou commentaires contenant des informations privees
- Historique de connexion avec adresses IP

## Procedure

1. Creer un backup de production

```bash
ssh user@dropit-app.fr
docker exec dropit-postgres pg_dump -U postgres dropit | gzip > /tmp/prod-backup-$(date +%Y%m%d).sql.gz
```

2. Restaurer en environnement de staging

```bash
# Sur le serveur de staging ou en local
gunzip -c prod-backup-YYYYMMDD.sql.gz | docker exec -i staging-postgres psql -U postgres dropit_staging
```

3. Executer le script d'anonymisation

```bash
docker exec -i staging-postgres psql -U postgres dropit_staging < scripts/anonymize-data.sql
```

Consultez `scripts/anonymize-data.sql` pour le detail des transformations appliquees.

## Conservation des donnees anonymisees

- Les donnees anonymisees peuvent etre conservees en staging sans limite de duree
- Peuvent etre partagees avec des developpeurs ou testeurs
- Ne jamais utiliser de donnees de production brutes hors de l'environnement de production
- Ne jamais commiter de dumps contenant des donnees reelles dans Git
