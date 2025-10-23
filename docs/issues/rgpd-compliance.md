# Conformité RGPD - Audit et Actions Requises

**Date de l'audit** : 23 octobre 2025
**Statut** : ⚠️ Non-conforme - Actions urgentes requises

---

## Résumé Exécutif

### ✅ Points Conformes

- [x] **Checkbox de consentement à l'inscription** - Implémentée avec lien vers politique de confidentialité
- [x] **Backend de gestion des données** - Use-cases pour consultation, modification, suppression existent
- [x] **Authentification sécurisée** - Better-auth avec email/password et OAuth
- [x] **Sessions avec expiration** - Gestion correcte des tokens et sessions

### ⚠️ Points Partiellement Conformes

- [~] **Minimisation des données** - Collecte proportionnée mais non documentée
- [~] **Droit de rectification** - Backend existe, UI frontend manquante
- [~] **Suppression des données** - Méthode existe mais incomplète (pas de cascade)

### ❌ Points Non-Conformes (Obligations Légales)

- [ ] **Politique de confidentialité incomplète** - Sections critiques manquantes
- [ ] **Droit d'accès** - Aucune UI pour consulter ses données
- [ ] **Droit à la portabilité** - Pas d'export de données
- [ ] **Droit à l'effacement** - Suppression non-exhaustive
- [ ] **Durées de conservation** - Non documentées
- [ ] **Liste des données collectées** - Non explicite dans la politique
- [ ] **Exercice des droits** - Pas de procédure documentée

---

## 1. Politique de Confidentialité - Sections Manquantes

### 📍 Fichier : `/packages/i18n/src/locales/fr/auth.json:59-97`

#### Problème 1 : Date Obsolète
```json
"lastUpdated": "Dernière mise à jour : Juin 2023"
```
**Action** : Mettre à jour à "Octobre 2025"

#### Problème 2 : Sections RGPD Manquantes

La politique actuelle contient 5 sections. Il en manque **10 critiques** :

##### a) Identité du Responsable de Traitement (Art. 13.1.a)
```
6. Responsable du traitement des données
   - Nom de la société/organisation
   - Adresse postale complète
   - Email de contact : privacy@dropit.com (ou équivalent)
   - Numéro de téléphone (optionnel mais recommandé)
   - Si applicable : Délégué à la Protection des Données (DPO)
```

##### b) Liste Exhaustive des Données Collectées (Art. 13.1.c)
```
1. Informations que nous collectons (À AMÉLIORER)

Actuellement trop vague. Doit lister explicitement :

Données de compte :
- Nom complet
- Adresse email
- Mot de passe (hashé avec bcrypt/argon2)
- Photo de profil (optionnel)
- Date de création du compte
- Statut de vérification email

Données de profil athlète :
- Prénom et nom
- Date de naissance
- Pays
- Genre

Données de performance :
- Sessions d'entraînement et leur contenu
- Records personnels
- Métriques physiques
- Statuts de compétition

Données techniques :
- Adresse IP de connexion
- Type de navigateur (User-Agent)
- Jetons de session
- Horodatage des connexions

Données tierces (OAuth) :
- Tokens d'accès GitHub (si connexion via GitHub)
- Identifiant GitHub
```

##### c) Finalités du Traitement (Art. 13.1.c)
```
Chaque donnée doit avoir une finalité explicite :

- Email : Authentification, notifications importantes
- Mot de passe : Sécurisation du compte
- Nom : Personnalisation de l'interface
- Profil athlète : Gestion de l'entraînement sportif
- Date de naissance : Calcul de catégories d'âge en compétition
- Sessions d'entraînement : Suivi de progression, planification
- IP/User-Agent : Sécurité et détection de fraude
```

##### d) Base Légale du Traitement (Art. 13.1.c)
```
7. Base légale du traitement

Nous traitons vos données personnelles sur les bases légales suivantes :

- Exécution du contrat (Art. 6.1.b RGPD) :
  Nécessaire pour fournir le service de coaching/gestion d'entraînement

- Consentement (Art. 6.1.a RGPD) :
  Vous avez consenti au traitement lors de votre inscription

- Intérêt légitime (Art. 6.1.f RGPD) :
  Sécurité du compte, prévention de la fraude
```

##### e) Durées de Conservation (Art. 13.2.a)
```
8. Durée de conservation des données

Nous conservons vos données personnelles pour les durées suivantes :

- Compte actif : Tant que vous utilisez le service
- Compte inactif : [À DÉFINIR] mois sans connexion avant suppression
- Sessions actives : Jusqu'à expiration (configuré dans better-auth)
- Sessions expirées : [À DÉFINIR] jours avant nettoyage automatique
- Tokens de vérification email : 24 heures
- Tokens de réinitialisation mot de passe : 1 heure
- Logs de sécurité : [À DÉFINIR] mois

Après suppression de votre compte :
- Données personnelles : Suppression immédiate
- Données anonymisées (statistiques) : Conservation possible à des fins d'analyse
```

##### f) Droits des Utilisateurs (Art. 13.2.b)
```
9. Vos droits RGPD

Conformément au RGPD, vous disposez des droits suivants :

- Droit d'accès (Art. 15) :
  Obtenir une copie de toutes vos données personnelles

- Droit de rectification (Art. 16) :
  Corriger vos données inexactes ou incomplètes

- Droit à l'effacement / "droit à l'oubli" (Art. 17) :
  Demander la suppression de vos données

- Droit à la portabilité (Art. 20) :
  Recevoir vos données dans un format structuré (JSON)

- Droit d'opposition (Art. 21) :
  Vous opposer au traitement de vos données

- Droit de limitation (Art. 18) :
  Demander la limitation du traitement

Pour exercer ces droits :
1. Accédez à vos Paramètres > Mon compte
2. Utilisez les boutons "Exporter mes données" ou "Supprimer mon compte"
3. Ou contactez-nous : privacy@dropit.com
```

##### g) Transferts Internationaux de Données
```
10. Localisation et transfert des données

Vos données sont hébergées :
- Serveurs : [À PRÉCISER - ex: France/UE, AWS eu-west-1, etc.]
- Base de données PostgreSQL : [LOCALISATION]
- Emails (Brevo) : Union Européenne
- Services tiers : [LISTER]

Si transfert hors UE : Mécanismes de protection utilisés (clauses contractuelles types, etc.)
```

##### h) Sous-traitants et Partage de Données (Art. 13.1.e)
```
3. Informations que nous partageons (À AMÉLIORER)

Actuellement : "Avec votre consentement, pour raisons légales, avec administrateurs"

Doit lister explicitement tous les sous-traitants :

Sous-traitants techniques :
- Brevo (anciennement Sendinblue) : Envoi d'emails transactionnels
- [Hébergeur cloud] : Hébergement serveur et base de données
- PostgreSQL : Stockage des données
- Redis : Cache et sessions
- Typesense : Moteur de recherche

Nous ne partageons JAMAIS vos données personnelles à des fins commerciales ou publicitaires.

Partage légal uniquement dans les cas suivants :
- Obligation légale ou demande judiciaire
- Protection contre fraude ou abus
- Avec votre consentement explicite
- Administrateurs de votre organisation (coach/admin)
```

##### i) Cookies et Technologies de Suivi
```
11. Cookies et technologies similaires

Nous utilisons les cookies suivants :

Cookies strictement nécessaires (pas de consentement requis) :
- better-auth.session_token : Authentification et maintien de session
  Type : HttpOnly, Secure, SameSite=Lax
  Durée : [DURÉE DE LA SESSION]

Cookies analytics (si implémenté) :
- [À DOCUMENTER si vous ajoutez Google Analytics, Plausible, etc.]

Vous pouvez gérer vos cookies dans les paramètres de votre navigateur.
```

##### j) Sécurité des Données (Art. 32)
```
4. Sécurité des informations (À AMÉLIORER)

Mesures techniques et organisationnelles :

- Chiffrement des mots de passe : bcrypt/argon2
- Connexion HTTPS : TLS 1.3
- Cookies sécurisés : HttpOnly, Secure, SameSite
- Sessions avec expiration automatique
- Protection CSRF : Tokens anti-CSRF
- Accès base de données : Authentification stricte, principe du moindre privilège
- Sauvegardes régulières : [FRÉQUENCE]
- Mises à jour de sécurité : Patches réguliers
- Audits de code : [SI APPLICABLE]
```

##### k) Droit de Déposer une Plainte
```
12. Réclamation auprès de l'autorité de contrôle

Si vous estimez que le traitement de vos données viole le RGPD, vous avez le droit de déposer une plainte auprès de :

- CNIL (France) : https://www.cnil.fr/
  3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07
  Téléphone : 01 53 73 22 22

- Ou l'autorité de protection des données de votre pays de résidence
```

---

## 2. Fonctionnalités Utilisateur Manquantes

### 📍 Frontend : Pages Vides à Implémenter

#### Fichier 1 : `/apps/web/src/routes/__home.settings.tsx`
**Statut actuel** : Page vide
**Requis RGPD** : Interface pour exercer tous les droits

**Fonctionnalités à implémenter** :

```tsx
Sections requises :

1. Mon Profil
   - Modifier nom
   - Modifier email (avec re-vérification)
   - Changer mot de passe
   - Modifier photo de profil

2. Mes Données
   - Bouton : "Télécharger toutes mes données" (JSON export)
   - Liste des données stockées (résumé)
   - Dernière mise à jour

3. Confidentialité
   - Gestion des consentements (si applicable)
   - Historique des consentements donnés

4. Danger Zone
   - Bouton : "Supprimer mon compte"
   - Warning : "Cette action est irréversible"
   - Modale de confirmation avec :
     * Checkbox : "Je confirme vouloir supprimer mon compte"
     * Input : "Tapez votre email pour confirmer"
     * Input : "Entrez votre mot de passe"
     * Bouton : "Exporter mes données avant suppression"
```

#### Fichier 2 : `/apps/web/src/routes/__home.profile.tsx`
**Statut actuel** : Page vide
**Requis** : Consultation des données

```tsx
Sections requises :

1. Informations Personnelles
   - Nom, Email (lecture seule avec bouton "Modifier")
   - Date de création du compte
   - Dernière connexion

2. Profil Athlète
   - Prénom, Nom, Date de naissance, Pays
   - Bouton "Modifier"

3. Mes Statistiques (lecture seule)
   - Nombre de sessions d'entraînement
   - Records personnels
   - Dernière activité
```

#### Fichier 3 : `/apps/mobile/src/components/AccountScreen.tsx`
**Statut actuel** : Logout uniquement, note "To implement"
**Requis** : Mêmes fonctionnalités que web

---

## 3. API Backend - Endpoints Manquants

### 📍 Fichier : `/apps/api/src/modules/identity/`

#### Endpoint 1 : Export de Données (Droit à la portabilité - Art. 20)

**Nouveau fichier** : `/apps/api/src/modules/identity/application/use-cases/data-export.use-case.ts`

```typescript
Fonctionnalité :
- GET /api/user/export
- Authentification requise
- Retourne JSON structuré avec :
  {
    user: { id, name, email, createdAt, ... },
    athlete: { firstName, lastName, birthday, country, ... },
    trainingSessions: [...],
    personalRecords: [...],
    physicalMetrics: [...],
    competitorStatuses: [...],
    organizations: [...],
    exportDate: "2025-10-23T15:30:00Z",
    dataVersion: "1.0"
  }
```

**Contract** : Créer `/packages/contract/src/user.contract.ts`

#### Endpoint 2 : Suppression Complète du Compte (Droit à l'effacement - Art. 17)

**Nouveau fichier** : `/apps/api/src/modules/identity/application/use-cases/account-deletion.use-case.ts`

```typescript
Fonctionnalité :
- POST /api/user/delete-account
- Body : { email: string, password: string, confirmation: string }
- Vérification :
  * Email match avec utilisateur authentifié
  * Password valide
  * Confirmation = "DELETE MY ACCOUNT"

- Suppression cascade de TOUTES les entités liées :

Ordre de suppression :
1. AthleteTrainingSession (sessions d'entraînement)
2. PhysicalMetric (métriques physiques)
3. PersonalRecord (records personnels)
4. CompetitorStatus (statuts compétition)
5. Athlete (profil athlète)
6. Member (appartenances organisations) [DÉCISION : supprimer ou anonymiser ?]
7. Verification (tokens email/password)
8. Session (toutes les sessions actives)
9. Account (comptes OAuth)
10. User (utilisateur principal)

- Logging : Enregistrer la demande de suppression (audit trail)
- Réponse : 204 No Content
- Email de confirmation : "Votre compte a été supprimé"
```

**Problèmes actuels dans `/apps/api/src/modules/identity/application/user.use-cases.ts:remove()`** :
- ❌ Ne supprime pas les entités liées
- ❌ Pas de vérification de mot de passe
- ❌ Pas d'audit trail

#### Endpoint 3 : Mise à Jour du Profil

**Fichier existant** : `/apps/api/src/modules/identity/application/user.use-cases.ts:update()`

**Problème** : Méthode existe mais :
- ❌ Pas de controller exposé au frontend
- ❌ Pas de contract ts-rest

**Action** :
1. Créer controller : `/apps/api/src/modules/identity/interface/controllers/user.controller.ts`
2. Créer contract : `/packages/contract/src/user.contract.ts`
3. Exposer : `PATCH /api/user/profile`

---

## 4. Base de Données - Cascading Deletes

### 📍 Fichiers MikroORM Entities

**Problème** : Les relations entre entités ne sont pas configurées pour supprimer en cascade.

**Entités à modifier** :

#### `/apps/api/src/modules/identity/domain/user.entity.ts`
```typescript
@OneToOne(() => Athlete, { orphanRemoval: true, onDelete: 'CASCADE' })
athlete?: Athlete;

@OneToMany(() => Account, account => account.user, { orphanRemoval: true })
accounts = new Collection<Account>(this);

@OneToMany(() => Session, session => session.user, { orphanRemoval: true })
sessions = new Collection<Session>(this);

@OneToMany(() => Verification, verification => verification.user, { orphanRemoval: true })
verifications = new Collection<Verification>(this);
```

#### `/apps/api/src/modules/athletes/domain/athlete.entity.ts`
```typescript
@OneToMany(() => AthleteTrainingSession, ats => ats.athlete, { orphanRemoval: true })
trainingSessions = new Collection<AthleteTrainingSession>(this);

@OneToMany(() => PersonalRecord, pr => pr.athlete, { orphanRemoval: true })
personalRecords = new Collection<PersonalRecord>(this);

@OneToMany(() => PhysicalMetric, pm => pm.athlete, { orphanRemoval: true })
physicalMetrics = new Collection<PhysicalMetric>(this);

@OneToMany(() => CompetitorStatus, cs => cs.athlete, { orphanRemoval: true })
competitorStatuses = new Collection<CompetitorStatus>(this);
```

**Nouvelle migration requise** après modification des entités.

---

## 5. Durées de Conservation - À Définir et Documenter

### Décisions à Prendre

| Donnée | Durée Recommandée | À Décider | Action Automatique |
|--------|-------------------|-----------|-------------------|
| Compte inactif | 24-36 mois | ⬜ | Email warning puis suppression |
| Sessions expirées | 30 jours | ⬜ | Cleanup automatique |
| Tokens vérification email | 24h | ⬜ | Déjà géré ? Vérifier |
| Tokens reset password | 1h | ⬜ | Déjà géré ? Vérifier |
| Logs de connexion | 12 mois | ⬜ | Purge automatique |
| Données après suppression | 0 (immédiat) | ⬜ | Hard delete |
| Backup de base de données | 30 jours | ⬜ | Rotation automatique |

**Action** :
1. Définir chaque durée selon votre politique métier
2. Documenter dans la politique de confidentialité
3. Implémenter des cron jobs de nettoyage si nécessaire

---

## 6. Audit Trail et Logging

### Fonctionnalité Manquante : Traçabilité des Demandes RGPD

**Nouveau modèle** : `/apps/api/src/modules/identity/domain/gdpr-request.entity.ts`

```typescript
Entité : GdprRequest

Champs :
- id: string
- userId: string
- requestType: 'ACCESS' | 'EXPORT' | 'RECTIFY' | 'DELETE' | 'PORTABILITY'
- requestedAt: Date
- processedAt: Date
- status: 'PENDING' | 'COMPLETED' | 'REJECTED'
- ipAddress: string
- userAgent: string
- notes: string (optionnel)

Objectif :
- Prouver la conformité en cas d'audit CNIL
- Suivre les demandes d'exercice de droits
- Statistiques internes
```

**Logging à implémenter** :
- Chaque export de données → log
- Chaque suppression de compte → log
- Chaque modification de profil → log (optionnel)

---

## 7. Tests et Validation

### Tests à Créer

#### Test 1 : Suppression Complète du Compte
```typescript
Fichier : /apps/api/src/test/gdpr-compliance.integration.ts

Scénario :
1. Créer un utilisateur avec profil complet
2. Créer athlete + training sessions + personal records
3. Appeler DELETE /api/user/delete-account
4. Vérifier que TOUTES les entités liées sont supprimées
5. Vérifier qu'aucune donnée orpheline ne reste

Assertions :
- User : NULL
- Athlete : NULL
- AthleteTrainingSession : []
- PersonalRecord : []
- PhysicalMetric : []
- CompetitorStatus : []
- Account : []
- Session : []
- Verification : []
```

#### Test 2 : Export de Données
```typescript
Scénario :
1. Créer utilisateur avec données complètes
2. Appeler GET /api/user/export
3. Vérifier que le JSON contient TOUTES les données
4. Vérifier le format de la réponse
5. Vérifier qu'aucune donnée sensible tierce n'est incluse
```

---

## 8. Checklist d'Implémentation Prioritaire

### 🔴 URGENT (Obligations Légales - Sous 30 jours)

- [ ] **Mettre à jour la politique de confidentialité**
  - [ ] Mettre à jour date : Octobre 2025
  - [ ] Ajouter section "Responsable de traitement"
  - [ ] Lister toutes les données collectées
  - [ ] Ajouter finalités et base légale
  - [ ] Documenter durées de conservation
  - [ ] Ajouter section "Vos droits RGPD"
  - [ ] Ajouter procédure pour exercer droits
  - [ ] Lister sous-traitants
  - [ ] Documenter localisation données
  - [ ] Ajouter section cookies
  - [ ] Ajouter droit de réclamation CNIL
  - Fichiers : `/packages/i18n/src/locales/{fr,en}/auth.json`

- [ ] **Implémenter export de données**
  - [ ] Créer use-case `data-export.use-case.ts`
  - [ ] Créer endpoint `GET /api/user/export`
  - [ ] Créer contract ts-rest
  - [ ] Ajouter bouton "Télécharger mes données" dans Settings
  - [ ] Tester export complet

- [ ] **Implémenter suppression complète**
  - [ ] Modifier entités MikroORM (cascade delete)
  - [ ] Créer migration
  - [ ] Créer use-case `account-deletion.use-case.ts`
  - [ ] Créer endpoint `POST /api/user/delete-account`
  - [ ] Ajouter UI de confirmation dans Settings
  - [ ] Tester suppression exhaustive

- [ ] **Implémenter page Settings**
  - [ ] Section "Mon Profil"
  - [ ] Section "Mes Données" avec export
  - [ ] Section "Danger Zone" avec suppression
  - Fichier : `/apps/web/src/routes/__home.settings.tsx`

### 🟡 IMPORTANT (Sous 60 jours)

- [ ] **Implémenter édition de profil**
  - [ ] Créer controller user.controller.ts
  - [ ] Exposer endpoint PATCH /api/user/profile
  - [ ] UI de modification dans Profile ou Settings
  - [ ] Changement d'email avec re-vérification
  - [ ] Changement de mot de passe

- [ ] **Définir durées de conservation**
  - [ ] Décider durée pour comptes inactifs
  - [ ] Décider durée pour sessions expirées
  - [ ] Décider durée pour logs
  - [ ] Documenter dans politique
  - [ ] Implémenter cleanup automatique (cron jobs)

- [ ] **Audit trail RGPD**
  - [ ] Créer entité GdprRequest
  - [ ] Logger toutes les demandes d'export/suppression
  - [ ] Interface admin pour consulter les logs

- [ ] **App mobile**
  - [ ] Implémenter AccountScreen complet
  - [ ] Export de données
  - [ ] Suppression de compte

### 🟢 AMÉLIORATION CONTINUE (Sous 90 jours)

- [ ] **Tests d'intégration RGPD**
  - [ ] Test suppression complète
  - [ ] Test export exhaustif
  - [ ] Test modification profil

- [ ] **Documentation technique**
  - [ ] Guide pour les développeurs sur les pratiques RGPD
  - [ ] Diagramme des flux de données
  - [ ] Procédure de réponse aux demandes utilisateur

- [ ] **Anonymisation vs Suppression**
  - [ ] Évaluer si certaines données doivent être anonymisées au lieu de supprimées
  - [ ] Implémenter fonction d'anonymisation si nécessaire

- [ ] **Cookie consent banner**
  - [ ] Si analytics ajouté : implémenter banner de consentement

---

## 9. Risques et Pénalités

### Risques de Non-Conformité

**Sanctions RGPD (Art. 83)** :
- Amendes jusqu'à **20 millions €** ou **4% du chiffre d'affaires annuel mondial**
- Violation des droits des personnes (Art. 15-22) : Catégorie maximale

**Violations actuelles identifiées** :
- ❌ Politique de confidentialité incomplète → Art. 13
- ❌ Droit d'accès non implémenté → Art. 15
- ❌ Droit à la portabilité manquant → Art. 20
- ❌ Droit à l'effacement incomplet → Art. 17
- ❌ Pas de procédure pour exercer droits → Art. 12

**Risque de plainte utilisateur** :
- Tout utilisateur peut déposer plainte à la CNIL s'il ne peut exercer ses droits
- Délai de réponse légal : **1 mois** (prolongeable à 3 mois si complexe)

### Recommandation

**Bloquer toute nouvelle inscription** jusqu'à mise en conformité ? **Non**, mais :
1. Prioriser les actions URGENTES dans les 30 jours
2. Informer les utilisateurs actuels des améliorations à venir
3. Mettre en place rapidement l'export et la suppression

---

## 10. Ressources et Contacts

### Documentation RGPD
- Texte officiel RGPD : https://www.cnil.fr/fr/reglement-europeen-protection-donnees
- Guide pratique CNIL : https://www.cnil.fr/fr/principes-cles
- Modèles CNIL : https://www.cnil.fr/fr/modeles

### Contacts Internes
- Responsable conformité RGPD : [À DÉFINIR]
- Contact technique : [VOS INFOS]
- Email privacy : privacy@dropit.com (à créer)

### Support Externe
- CNIL : https://www.cnil.fr/fr/plaintes
- DPO externe (si besoin) : [À ÉVALUER]

---

## 11. Suivi de l'Implémentation

**Prochaine revue** : [DATE + 30 JOURS]
**Responsable** : [NOM]
**Objectif** : 100% conformité d'ici [DATE + 90 JOURS]

### Tracking des Actions

| Action | Priorité | Assigné | Deadline | Statut | Notes |
|--------|----------|---------|----------|--------|-------|
| Mise à jour politique confidentialité | 🔴 | | J+7 | ⬜ | |
| Endpoint export données | 🔴 | | J+14 | ⬜ | |
| Suppression complète compte | 🔴 | | J+21 | ⬜ | |
| Page Settings | 🔴 | | J+30 | ⬜ | |
| Édition profil | 🟡 | | J+45 | ⬜ | |
| Durées conservation | 🟡 | | J+60 | ⬜ | |
| Tests RGPD | 🟢 | | J+75 | ⬜ | |
| App mobile | 🟢 | | J+90 | ⬜ | |

---

**Fin du document**
**Prochaine mise à jour recommandée** : Après implémentation des actions URGENTES
