<a name="readme-top"></a>

<!-- LOGO DU PROJET -->
<br />
<div align="center">
  <a href="https://github.com/Netsbump/Dropit">
    <img src="chemin-vers-votre-logo-si-disponible" alt="Logo" width="80" height="80">
  </a>
<h3 align="center">DropIt : Application de Club d'Haltérophilie</h3>
  <p align="center">
    Une application pour optimiser le suivi et la gestion de l'entraînement en haltérophilie.
    <br />
    <br />
    Pour plus de détails, vous pouvez 
    <br />
    <a href="https://docs-dropit.pages.dev/"><strong>Explorer la documentation »</strong></a>
    <br />
    <br />
    <a href="https://dropit.sten-lvs.com">Voir la Démonstration</a>
    ·
    <a href="https://github.com/Netsbump/Dropit/issues">Signaler un Bug</a>
    ·
    <a href="https://github.com/Netsbump/Dropit/pulls">Demander une Fonctionnalité</a>
  </p>
</div>

***

<!-- TABLE DES MATIÈRES -->
<details>
  <summary>Table des Matières</summary>
  <ol>
    <li><a href="#description-du-projet">A propos du projet</a></li>
    <li><a href="#fonctionnalites">Fonctionnalités</a></li>
    <li><a href="#technologies-utilisees">Technologies Utilisées</a></li>
    <li><a href="#prerequis">Pré-requis</a></li>
    <li><a href="#licence">Licence</a></li>
    <li><a href="#contact">Contact</a></li>
    <!-- Ajoutez d'autres sections selon vos besoins -->
  </ol>
</details>

<!-- A PROPOS DU PROJET -->
<p id="description-du-projet"></p>

# À propos du Projet

DropIt est une application web conçue pour optimiser le suivi et la gestion de l'entraînement en haltérophilie. Ce projet vise à fournir une solution intuitive pour les athlètes et entraîneurs, tout en consolidant mes compétences en développement logiciel.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

***

<!-- FONCTIONNALITES -->
<p id="fonctionnalites"></p>

## Fonctionnalités

- Gestion du profil : Les utilisateurs créent et mettent à jour leur profil, y compris les informations de base et les statistiques de performance telles que le poids et la taille.
- Gestion des athlètes : Les coachs ont accès à une interface de gestion pour accéder aux profils des athlètes, créer et publier des entraînements, et gérer une bibliothèque d'exercices.
- Gestion des entrainements : Les coachs ont accès à une interface de gestion pour créer et consulter une bibliothèque d'exercices, de blocs d'exercices et d'entrainements.
- Calendrier d'entraînement personnalisé : Les athlètes peuvent visualiser la programmation quotidienne avec des détails sur les exercices, les pourcentages de travail et les répétitions.
- Gestion des performances : Une page dédiée permet aux athlètes de saisir et de visualiser leurs maxima pour chaque exercice.
- Notifications et Annonces : Un système de notifications informe les utilisateurs des mises à jour importantes, avec des annonces et des messages de la part des coachs.
- Réglages et Support : Les utilisateurs peuvent accéder aux réglages de l'application, y compris la gestion du compte, le changement de mot de passe, la FAQ et l'aide.

## Fonctionnalités à Venir

- Suivi de la Progression : Des graphiques et des visualisations pour un suivi détaillé des progrès.
- Mode Hors Ligne : Permettant l'accès aux fonctionnalités essentielles même sans connexion internet.
- Personnalisation de l'Interface : Introduction d'un mode clair/sombre et options de choix de langue.

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

***

<!-- TECHNOLOGIES UTILISEES -->
<p id="technologies-utilisees"></p>

## Technologies Utilisées

- Front-End : React, TypeScript, TanStack (Query + Router), Shadcn + Tailwind
- Back-End : Nest.js + MikroORM 
- Base de Données : PostgreSQL
- Recherche: Typesense
- Cache: Redis
- CI/CD : Docker, Docker Compose, GitHub Actions
- Qualité du Code : Biome
- Monorepo: Turborepo

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

***

<!-- PRE-REQUIS -->
<p id="prerequis"></p>

## Pré-requis et Installation

### Prérequis

Assurez-vous d'avoir installé les éléments suivants avant de commencer :

- **Node.js** : Version 20 ou supérieure.
- **pnpm** : Gestionnaire de paquets (installer avec `npm install -g pnpm`).
- **Docker** et **Docker Compose** : Pour l'exécution des services (Redis, PostgreSQL, Typesense).

### Cloner le projet

```bash
git clone https://github.com/Netsbump/dropit.git
cd dropit
```

### Installer les dépendances

```bash
pnpm install
```

### Build initial

Pour permettre aux packages dans packages/ d'être utilisés dans les différents services, vous devez effectuer un build initial :

```bash
pnpm build
```

### Configuration des variables d'environnements

Il y a seulement un seul fichier `.env` à la racine qui faut créer 

```bash
cp .env.example .env
```

### Lancer le projet (développement)

Démarrer les services via Docker Compose (ex: PostgreSQL, Redis, Typesence):

```bash
docker-compose up -d
```

Lancer le monorepo (backend + frontend) en mode développement:

```bash
pnpm dev
```

<p align="right">(<a href="#readme-top">retour en haut/a>)</p>

<!-- LICENCE -->
<p id="licence"></p>

## Licence

Distribué sous la Licence MIT. Voir le fichier LICENSE pour plus d'informations.
<p align="right">(<a href="#readme-top">retour en haut</a>)</p>

***

<!-- CONTACT -->
<p id="contact"></p>

## Contact

Bluesky - [@mon_bluesky] - email@example.com
Linkedin 

<p align="right">(<a href="#readme-top">retour en haut</a>)</p>
