# Architecture Hexagonale dans DropIt

Ce document est la **référence** pour les patterns transverses de l’API DropIt : ports, adapters, injection Nest avec tokens, `useFactory`, découpage canal/transport, séparation HTTP / application / infrastructure, et compromis pragmatiques du projet.

Il garde aussi une dimension de **journal d’évolution** : l’API a commencé avec une architecture n-tiers plus classique, puis certains bounded contexts ont été migrés progressivement vers une architecture hexagonale. Aujourd’hui, le bounded context **`athletes`** est le cas de référence le plus abouti.

---

## Vue d’ensemble

DropIt utilise une approche inspirée de l’architecture hexagonale, aussi appelée **Ports & Adapters**, pour isoler la logique métier des frameworks et des détails d’infrastructure.

L’objectif n’est pas d’appliquer une Clean Architecture académique partout et immédiatement. L’objectif est plutôt de faire évoluer le monorepo vers une architecture plus testable, plus lisible et moins couplée, en priorisant les bounded contexts qui portent le plus de logique métier.

### Objectifs

- ✅ **Indépendance du framework** : la logique métier ne dépend pas de NestJS.
- ✅ **Testabilité** : les use cases sont testables sans `TestingModule` Nest.
- ✅ **Découplage infrastructure** : l’application dépend de ports, pas de MikroORM, Auth, Training, Brevo, etc.
- ✅ **Clarté des responsabilités** : HTTP, application, domaine et infrastructure ne jouent pas le même rôle.
- ✅ **Migration progressive** : un module peut être amélioré sans réécrire toute l’API.

### Pourquoi cette architecture ?

L’API a progressivement évolué d’une architecture **n-tiers classique** vers cette approche hexagonale partielle. Cette évolution répond à une double motivation : approfondir des patterns architecturaux rencontrés en contexte professionnel, et anticiper des évolutions futures nécessitant l’isolation de la logique métier, par exemple l’intégration de matériel externe, de sources de données tierces ou de nouveaux canaux d’entrée.

Cette migration reste pragmatique : tous les modules ne sont pas au même niveau de maturité. Certains modules historiques conservent encore des entités ou services plus couplés à l’ORM ou à NestJS. En revanche, le bounded context **`athletes`** illustre désormais la cible actuelle : domaine TypeScript pur, ports entrants/sortants explicites, adapters isolés, composition Nest dans le module.

---

## Implémentation pragmatique

DropIt n’est pas une implémentation exhaustive et dogmatique de l’hexagonal. Les compromis actuels sont assumés.

### Ce qui est visé

- Les classes `application/` et `domain/` ne doivent pas dépendre de NestJS.
- Les use cases reçoivent leurs dépendances via des interfaces.
- Les dépendances techniques vivent dans `infrastructure/` ou `http/`.
- Le `*Module` Nest est la couche de composition : il branche les tokens vers les implémentations concrètes.

### Ce qui varie encore selon les modules

- Certains bounded contexts historiques ont encore des entités domaine couplées à MikroORM.
- Certains services applicatifs sont encore plus proches du modèle n-tiers.
- Certains contrats d’erreur ou DTOs sont encore à affiner.

### Cas de référence actuel : `athletes`

Le bounded context `athletes` est aujourd’hui globalement aligné avec l’architecture cible :

- ✅ Domaine pur TypeScript : `Athlete`, `PersonalRecord`, `PhysicalMetric`, `CompetitorStatus`.
- ✅ Entités MikroORM sorties du domaine et placées dans `modules/database/entities`.
- ✅ Ports entrants découpés par capacité métier.
- ✅ Ports sortants pour persistence et dépendances inter-BC.
- ✅ Repositories MikroORM isolés en infrastructure.
- ✅ Adapters vers Auth et Training derrière des ports.
- ✅ Mappers séparés entre persistence/domain et HTTP/DTO.
- ✅ Policies d’accès dans la couche application.
- ✅ Exception filter HTTP dédié.
- ✅ Read-models applicatifs pour les vues optimisées.

Restes, compromis ou chantiers connus :

- Certains inputs applicatifs utilisent encore des types issus de `@dropit/schemas`.
- Les erreurs applicatives du BC exposent encore un `statusCode`, pratique pour le mapping HTTP mais pas totalement neutre vis-à-vis du transport.
- Les tests doivent être renforcés pour profiter réellement de cette architecture : tests unitaires des objets domaine et use cases avec ports mockés, sans `TestingModule` Nest ni base de données.
- La responsabilité de génération des UUID doit être clarifiée : aujourd’hui elle repose encore largement sur MikroORM / la persistence, alors que l’objectif serait que le domaine ou l’application du BC concerné crée explicitement ses IDs, en s’appuyant sur le shared kernel (`IdGenerator`, `UuidIdGenerator`, types d’IDs brandés).
- Les autres bounded contexts ne sont pas tous au même niveau de séparation.

---

## Structure des couches

Structure cible illustrée par `apps/api/src/modules/athletes` :

```txt
modules/
└── athletes/
    ├── domain/
    │   ├── athlete.ts
    │   ├── personal-record.ts
    │   ├── physical-metric.ts
    │   ├── competitor-status.ts
    │   └── *-id.ts
    │
    ├── application/
    │   ├── athlete-profiles.ts
    │   ├── athlete-personal-records.ts
    │   ├── athlete-physical-metrics.ts
    │   ├── athlete-competition-status.ts
    │   ├── ports/
    │   │   ├── in/
    │   │   └── out/
    │   ├── policies/
    │   ├── errors/
    │   └── read-models/
    │
    ├── infrastructure/
    │   ├── mikro-athlete.repository.ts
    │   ├── mikro-personal-record.repository.ts
    │   ├── mikro-physical-metric.repository.ts
    │   ├── mikro-competitor-status.repository.ts
    │   ├── auth-organization-membership.adapter.ts
    │   ├── auth-athlete-user-profile.adapter.ts
    │   ├── training-exercise-catalog.adapter.ts
    │   └── mappers/
    │
    ├── http/
    │   ├── athlete.controller.ts
    │   ├── personal-record.controller.ts
    │   ├── physical-metric.controller.ts
    │   ├── competitor-status.controller.ts
    │   ├── athlete-exception.filter.ts
    │   └── mappers/
    │
    └── athletes.module.ts
```

### Règle de placement

- **`domain/`** : objets métier, invariants, value objects/IDs, erreurs domaine. Pas de NestJS, pas de MikroORM, pas d’API externe.
- **`application/`** : use cases, ports, policies, erreurs applicatives, read-models. Pas de décorateurs Nest, pas d’accès direct à l’ORM.
- **`application/ports/in/`** : contrats appelés par les adapters entrants, par exemple HTTP.
- **`application/ports/out/`** : contrats utilisés par les use cases pour sortir du cœur applicatif : repositories, autres BC, APIs externes.
- **`infrastructure/`** : adapters sortants : repositories MikroORM, adapters vers Auth/Training, SDKs externes, mappers persistence.
- **`http/`** : adapters entrants HTTP : controllers, mappers DTO, filters, parsing des paramètres externes.
- **`*Module` Nest** : composition uniquement — enregistre les providers, `useFactory` / `useClass`, et relie chaque token `Symbol` à son implémentation.

> Dans d’anciens exemples ou dans de la littérature, la couche HTTP peut être appelée `interface/`. Dans DropIt, le BC `athletes` utilise désormais le nom explicite `http/` pour l’adapter entrant HTTP.

---

## Flux de données

### Requête HTTP → réponse HTTP

```txt
1. HTTP Request
   ↓
2. 🔴 Controller HTTP NestJS
   - Applique guards / permissions
   - Parse les IDs externes
   - Mappe body/params vers inputs applicatifs
   ↓
3. 🟢 Use case application
   - Orchestre le cas d’usage
   - Applique les règles applicatives
   - Appelle les policies et ports sortants
   ↓
4. 🔵 Domaine
   - Porte les invariants métier
   - Construit / modifie des objets valides
   ↓
5. 🟡 Adapter infrastructure
   - Repository MikroORM, adapter Auth, adapter Training, API externe...
   ↓
6. 🟢 Use case application
   - Retourne domaine ou read-model
   ↓
7. 🔴 Mapper HTTP / Exception filter
   - Transforme le résultat ou l’erreur en réponse HTTP
   ↓
8. HTTP Response
```

```mermaid
flowchart TD
  Client[Client HTTP] --> Controller[HTTP Controller]
  Controller --> UseCase[Application Use Case]
  UseCase --> Domain[Domain Object]
  UseCase --> OutPort[Output Port]
  OutPort --> Adapter[Infrastructure Adapter]
  Adapter --> DB[(DB / External BC / API)]
  UseCase --> Controller
  Controller --> Response[HTTP Response]
```

---

## Ports & Adapters

### Qu’est-ce qu’un port ?

Un **port** est une interface qui définit un contrat. Il représente ce que le cœur applicatif expose ou ce dont il a besoin.

#### Input port

Un input port décrit ce qu’un adapter entrant peut appeler.

Exemple dans `athletes` :

```typescript
// application/ports/in/athlete-profiles.port.ts
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');

export interface IAthleteProfiles {
  findById(athleteId: AthleteId, currentUserId: UserId, organizationId: OrganizationId): Promise<Athlete>;
  create(data: AthleteCreation): Promise<Athlete>;
  updateOwn(athleteId: AthleteId, data: AthleteUpdate, userId: UserId): Promise<Athlete>;
}
```

Le BC `athletes` expose plusieurs ports entrants au lieu d’un seul gros service :

- `ATHLETE_PROFILES`
- `ATHLETE_PERSONAL_RECORDS`
- `ATHLETE_PHYSICAL_METRICS`
- `ATHLETE_COMPETITION_STATUS`

Ce découpage rend les responsabilités plus lisibles qu’un unique `AthleteUseCases` monolithique.

#### Output port

Un output port décrit une dépendance dont l’application a besoin.

Exemple repository :

```typescript
// application/ports/out/athlete.repository.port.ts
export const ATHLETE_REPO = Symbol('ATHLETE_REPO');
export const ATHLETE_READ_REPO = Symbol('ATHLETE_READ_REPO');

export interface IAthleteRepository {
  findById(athleteId: AthleteId): Promise<Athlete | null>;
  findByUserId(userId: UserId): Promise<Athlete | null>;
  save(athlete: Athlete): Promise<Athlete>;
  remove(athlete: Athlete): Promise<void>;
}
```

Exemples de ports inter-BC dans `athletes` :

- `IOrganizationMembership` : masque le BC Auth / membership.
- `IAthleteUserProfile` : masque le profil utilisateur Auth.
- `IExerciseCatalog` : masque le catalogue d’exercices du BC Training.

Ainsi, les use cases `athletes` ne dépendent pas directement des implémentations Auth ou Training.

### Qu’est-ce qu’un adapter ?

Un **adapter** est une implémentation concrète d’un port.

#### Driving adapter / adapter entrant

Il appelle l’application depuis l’extérieur.

Exemple : un controller HTTP NestJS.

```typescript
@Controller()
export class AthleteController {
  constructor(
    @Inject(ATHLETE_PROFILES)
    private readonly athleteProfiles: IAthleteProfiles
  ) {}
}
```

Le controller dépend du port `IAthleteProfiles`, pas d’une classe concrète de use case.

#### Driven adapter / adapter sortant

Il implémente un port sortant avec une technologie précise.

Exemples dans `athletes` :

- `MikroAthleteRepository` implémente `IAthleteRepository` et `IAthleteReadRepository` avec MikroORM.
- `AuthOrganizationMembershipAdapter` implémente `IOrganizationMembership` en s’appuyant sur Auth.
- `AuthAthleteUserProfileAdapter` implémente `IAthleteUserProfile` en s’appuyant sur Auth/User.
- `TrainingExerciseCatalogAdapter` implémente `IExerciseCatalog` en s’appuyant sur Training.

---

## Domaine pur et persistence séparée

Le BC `athletes` ne met plus les décorateurs MikroORM dans ses objets domaine.

### Domaine

```typescript
export class Athlete {
  public readonly id: AthleteId | null;
  public readonly userId: UserId;
  public readonly firstName: string;
  public readonly lastName: string;

  constructor(params: AthleteProps) {
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!firstName) {
      throw new InvalidAthleteError('First name is required');
    }

    if (!lastName) {
      throw new InvalidAthleteError('Last name is required');
    }

    this.id = params.id ?? null;
    this.userId = params.userId;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
```

### Persistence

Les entités MikroORM vivent dans `apps/api/src/modules/database/entities` et sont converties via des mappers dans `infrastructure/mappers`.

Ce choix évite que le domaine dépende de MikroORM et permet de faire évoluer la persistence sans faire fuiter ses détails dans les use cases.

---

## Injection de dépendances NestJS

### Pourquoi des tokens `Symbol` ?

En TypeScript, les interfaces n’existent pas au runtime. On ne peut pas injecter une interface directement :

```typescript
@Inject(IAthleteProfiles) // ❌ IAthleteProfiles n'existe pas au runtime
```

On utilise donc un token :

```typescript
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');

@Inject(ATHLETE_PROFILES) // ✅ Existe au runtime
```

### Pourquoi pas de `@Injectable()` dans les use cases ?

Les use cases sont dans la couche application et doivent rester framework-agnostic.

```typescript
// ❌ Mauvais : couplage NestJS
@Injectable()
export class AthleteProfiles {
  constructor(@Inject(ATHLETE_REPO) private readonly repo: IAthleteRepository) {}
}

// ✅ Bon : TypeScript pur
export class AthleteProfiles {
  constructor(private readonly repo: IAthleteRepository) {}
}
```

Le même use case peut alors être utilisé depuis NestJS, une CLI, un worker, une Lambda, etc.

### Pourquoi utiliser `useFactory` ?

Comme les use cases n’ont pas de décorateurs Nest, le module Nest est responsable de leur construction.

```typescript
{
  provide: ATHLETE_PROFILES,
  useFactory: (
    athleteRepo: IAthleteRepository,
    athleteReadRepo: IAthleteReadRepository,
    athleteUserProfile: IAthleteUserProfile,
    organizationMembership: IOrganizationMembership,
    athleteAccessPolicy: IAthleteAccessPolicy
  ) => {
    return new AthleteProfiles(
      athleteRepo,
      athleteReadRepo,
      athleteUserProfile,
      organizationMembership,
      athleteAccessPolicy
    );
  },
  inject: [
    ATHLETE_REPO,
    ATHLETE_READ_REPO,
    ATHLETE_USER_PROFILE,
    ORGANIZATION_MEMBERSHIP,
    ATHLETE_ACCESS_POLICY,
  ],
}
```

Le `*Module` Nest devient la racine de composition : il sait quelles implémentations concrètes brancher, mais cette connaissance ne remonte pas dans l’application.

---

## Ports inter-BC

Un point important de la refactorisation `athletes` est l’isolation des dépendances vers les autres bounded contexts.

```mermaid
flowchart LR
  AthleteUseCase[Use case athletes]
  MembershipPort[IOrganizationMembership]
  UserPort[IAthleteUserProfile]
  ExercisePort[IExerciseCatalog]
  AuthMembership[AuthOrganizationMembershipAdapter]
  AuthUser[AuthAthleteUserProfileAdapter]
  TrainingExercise[TrainingExerciseCatalogAdapter]
  AuthBC[BC Auth]
  TrainingBC[BC Training]

  AthleteUseCase --> MembershipPort
  AthleteUseCase --> UserPort
  AthleteUseCase --> ExercisePort
  MembershipPort --> AuthMembership --> AuthBC
  UserPort --> AuthUser --> AuthBC
  ExercisePort --> TrainingExercise --> TrainingBC
```

Les use cases `athletes` parlent uniquement à des contrats métier locaux. Les adapters traduisent ensuite ces contrats vers Auth ou Training.

Cette règle limite les dépendances directes entre bounded contexts et évite que des choix internes à Auth ou Training contaminent le cœur applicatif `athletes`.

---

## Policies applicatives

Les règles d’accès qui relèvent du métier applicatif vivent dans `application/policies`.

Exemple : `AthleteAccessPolicy` centralise les règles du type :

- un coach peut voir les athlètes de son organisation ;
- un athlète peut voir ses propres données ;
- seul un coach peut gérer certaines données d’athlète ;
- un athlète doit appartenir à l’organisation courante.

Cela évite de disperser ces règles dans les controllers HTTP ou dans les repositories.

---

## Read-models

Le BC `athletes` distingue les objets domaine et certains read-models applicatifs.

Exemple : `AthleteDetailsReadModel` sert à retourner une vue enrichie d’un athlète avec des informations agrégées ou optimisées pour l’affichage.

La logique de requête optimisée vit dans l’infrastructure, mais le type retourné au use case est un read-model applicatif. Cela permet d’éviter de forcer le domaine à représenter toutes les projections nécessaires à l’UI.

Règle pratique :

- **Domaine** : objets qui portent des invariants et comportements métier.
- **Read-model** : projection utile à une lecture, sans prétendre être une entité métier complète.

---

## Gestion des erreurs

Le BC `athletes` ne traduit plus les erreurs business manuellement dans chaque controller.

Flux actuel :

```txt
Domain object
  → throw DomainError
Use case application
  → convertit en erreur applicative connue si nécessaire
Controller HTTP
  → laisse remonter
AthleteExceptionFilter
  → convertit en réponse HTTP
```

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant HTTP as Controller HTTP
  participant App as Use case
  participant Domain
  participant Filter as AthleteExceptionFilter

  Client->>HTTP: Request
  HTTP->>App: Execute use case

  alt Success
    App->>Domain: Build / update object
    Domain-->>App: Valid domain object
    App-->>HTTP: Result
    HTTP-->>Client: 2xx response
  else Expected error
    App--xHTTP: Throw known BC error
    HTTP--xFilter: Bubble up
    Filter-->>Client: statusCode + message
  else Unexpected technical error
    App--xHTTP: Throw unknown error
    HTTP--xFilter: Bubble up
    Filter->>Filter: Log stack
    Filter-->>Client: 500 + generic message
  end
```

Règles :

- Le domaine jette des erreurs domaine.
- Les IDs externes sont parsés à la frontière HTTP avec des parseurs domaine (`parseAthleteId`, `parsePersonalRecordId`, etc.).
- Les use cases convertissent les erreurs de validation domaine attendues en erreurs applicatives.
- Les controllers ne font pas de mapping d’erreur business à la main.
- `AthleteExceptionFilter` convertit les erreurs connues en réponses HTTP.
- Les erreurs techniques inconnues sont loggées côté serveur et retournées comme `500` générique.

Compromis actuel : certaines erreurs applicatives portent un `statusCode`. C’est simple et efficace pour le filter HTTP, mais une amélioration future pourrait consister à exposer un code métier neutre, puis mapper ce code vers HTTP uniquement dans l’adapter HTTP.

---

## Composition d’adaptateurs sortants : port → canal → transport

Parfois un seul adapter ne suffit pas. Certains modules découpent l’infrastructure en plusieurs responsabilités, chacune derrière un petit contrat.

- **Port sortant large** : ce que le use case voit, par exemple « envoyer une notification ».
- **Canal** : traduit une demande métier en message adapté au médium, par exemple construire un email HTML.
- **Transport** : envoie réellement le message avec une technologie précise, par exemple SMTP local en dev ou API HTTP en prod.

Le use case et les ports application ne choisissent pas Maildev ou Brevo. Ce choix vit dans une factory enregistrée dans le module.

Exemple concret dans le dépôt : module **notification** — `INotificationPort` / `NotificationAdapter`, canaux email/SMS/push, et `EMAIL_TRANSPORT` pour Brevo ou Maildev.

```mermaid
flowchart LR
  useCase[UseCase]
  notifPort[INotificationPort]
  notifAdapter[NotificationAdapter]
  emailChannel[IEmailChannel]
  emailAdapter[EmailAdapter]
  transport[IEmailTransport]
  brevo[BrevoAdapter]
  maildev[MaildevAdapter]

  useCase --> notifPort
  notifPort --> notifAdapter
  notifAdapter --> emailChannel
  emailChannel --> emailAdapter
  emailAdapter --> transport
  transport --> brevo
  transport --> maildev
```

### Factory pilotée par l’environnement

Quand l’implémentation dépend du contexte d’exécution, un `useFactory` permet de retourner la bonne classe sans mettre de `if (env === 'production')` dans les use cases ou adapters métier.

```typescript
{
  provide: EMAIL_TRANSPORT,
  useFactory: (): IEmailTransport => {
    if (config.env !== 'production') {
      return new MaildevAdapter(/* … */);
    }

    if (!config.email.brevo.apiKey) {
      throw new Error('BREVO_API_KEY is required in production');
    }

    return new BrevoAdapter(/* … */);
  },
}
```

Pour l’infrastructure indispensable, les factories sont aussi un bon endroit pour faire du **fail-fast** au démarrage : mieux vaut échouer au bootstrap si une clé API ou une URL critique manque, plutôt que découvrir l’erreur au premier appel en production.

---

## Chantiers de consolidation

### Tests métier

La refactorisation hexagonale n’a de valeur que si elle est exploitée dans les tests.

Pour les bounded contexts alignés avec cette architecture, les tests à privilégier sont :

- tests unitaires du domaine : invariants, méthodes métier, erreurs domaine ;
- tests unitaires des use cases : ports sortants remplacés par des doubles simples, sans NestJS ;
- tests des policies applicatives : règles d’accès et cas limites ;
- tests d’adapters séparés : repositories MikroORM, mappers persistence, mappers HTTP ;
- quelques tests d’intégration HTTP pour vérifier le wiring Nest, les guards et les filters.

L’objectif est d’éviter que chaque test métier démarre Nest ou touche la base de données. Les tests lourds doivent vérifier l’intégration, pas remplacer les tests du cœur métier.

### Génération des UUID

Un autre chantier concerne la responsabilité de génération des IDs.

Aujourd’hui, une partie des IDs est encore générée implicitement côté persistence / MikroORM. C’est pratique, mais cela veut dire que le domaine manipule parfois des objets sans identité jusqu’au `save`, et que la création de l’identité dépend d’un détail d’infrastructure.

La cible serait plutôt :

- le bounded context décide quand une identité est créée ;
- le domaine ou le use case reçoit un ID déjà généré au moment de construire l’objet ;
- la génération concrète reste abstraite derrière un port du shared kernel, par exemple `IdGenerator` / `UuidIdGenerator` ;
- les types d’IDs brandés (`AthleteId`, `PersonalRecordId`, `UserId`, etc.) continuent de valider et documenter les frontières.

Exemple d’intention :

```typescript
const athlete = new Athlete({
  id: parseAthleteId(this.idGenerator.generate()),
  userId,
  firstName,
  lastName,
});
```

Ce point reste à concevoir finement : selon le cas, la génération peut appartenir au use case, à une factory domaine, ou à un service domaine. L’important est d’éviter que MikroORM soit la seule source implicite de l’identité métier.

---

## Checklist pour un nouveau use case

### 1. Définir le port entrant

```typescript
export const MY_FEATURE = Symbol('MY_FEATURE');

export interface IMyFeature {
  doSomething(input: DoSomethingInput): Promise<MyResult>;
}
```

### 2. Définir les ports sortants nécessaires

```typescript
export const MY_REPOSITORY = Symbol('MY_REPOSITORY');

export interface IMyRepository {
  save(entity: MyEntity): Promise<MyEntity>;
}
```

### 3. Implémenter le use case en TypeScript pur

```typescript
export class MyFeature implements IMyFeature {
  constructor(private readonly repository: IMyRepository) {}

  async doSomething(input: DoSomethingInput): Promise<MyResult> {
    const entity = new MyEntity(input);
    return await this.repository.save(entity);
  }
}
```

### 4. Implémenter les adapters

```typescript
@Injectable()
export class MikroMyRepository implements IMyRepository {
  // Accès MikroORM et mapping entity persistence <-> domaine
}
```

### 5. Brancher dans le module Nest

```typescript
@Module({
  providers: [
    MikroMyRepository,
    { provide: MY_REPOSITORY, useClass: MikroMyRepository },
    {
      provide: MY_FEATURE,
      useFactory: (repository: IMyRepository) => new MyFeature(repository),
      inject: [MY_REPOSITORY],
    },
  ],
})
export class MyFeatureModule {}
```

### 6. Exposer via un adapter entrant

```typescript
@Controller()
export class MyFeatureController {
  constructor(
    @Inject(MY_FEATURE)
    private readonly myFeature: IMyFeature
  ) {}
}
```

---

## Règles pratiques

- Ne pas importer `@nestjs/*` dans `domain/` ou dans les use cases `application/`.
- Ne pas importer MikroORM dans `domain/` ou dans les use cases `application/`.
- Les controllers ne doivent pas contenir les règles métier principales.
- Les repositories ne doivent pas décider des règles métier : ils persistent et reconstruisent.
- Les dépendances vers d’autres bounded contexts passent par des ports locaux.
- Le module Nest est le seul endroit qui connaît le wiring concret.
- Les mappers HTTP et les mappers persistence sont deux responsabilités différentes.
- Les read-models sont acceptables pour les vues optimisées, à condition de ne pas polluer le domaine.

---

## État actuel du projet

### ✅ Athletes BC

État : **globalement aligné avec l’architecture cible**.

- `AthleteProfiles` ✅
- `AthletePersonalRecords` ✅
- `AthletePhysicalMetrics` ✅
- `AthleteCompetitionStatus` ✅
- Domaine pur TypeScript ✅
- Entités MikroORM séparées ✅
- Ports `in/out` explicites ✅
- Adapters Auth/Training derrière des ports ✅
- Exception filter HTTP dédié ✅

### ✅ Notification Module

État : architecture hexagonale adaptée au besoin du module.

- Ports IN/OUT, use case pur, adapters canaux + factory transport Maildev / Brevo ✅
- Voir [`apps/api/src/modules/notification/README.md`](../apps/api/src/modules/notification/README.md)

### 🟡 Auth Module

État : structure hexagonale en place, avec affinages au fil des besoins produit.

- Ports, use cases, adapters Better Auth, repositories MikroORM.
- Certaines zones restent liées aux contraintes du provider Auth et aux flows produit.

### 🟡 Training Module

État : migration partielle.

- Certains ports existent, notamment ceux consommés par `athletes`.
- Le module n’est pas encore au même niveau de séparation que `athletes`.

---

## Ressources

- [Hexagonal Architecture — Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Exemple appliqué dans le dépôt : [`apps/api/src/modules/athletes`](../apps/api/src/modules/athletes)
- Exemple notification : [`apps/api/src/modules/notification/README.md`](../apps/api/src/modules/notification/README.md)
