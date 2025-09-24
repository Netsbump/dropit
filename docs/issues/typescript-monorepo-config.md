# TypeScript Configuration Issue in Monorepo

## Problème

Dans un monorepo pnpm workspace, certaines options TypeScript dans `apps/api/tsconfig.json` peuvent causer des erreurs de découverte d'entités avec MikroORM.

## Symptômes

- MikroORM ne trouve pas les fichiers source `.ts` des entités
- Erreurs du type : `Source file '/path/to/entity.ts' not found`
- L'ORM cherche dans `dist/` mais ne trouve pas les sources correspondantes

## Solution

Commenter temporairement ces lignes dans `apps/api/tsconfig.json` :

```json
// "declaration": false,
// "declarationMap": false,
// "composite": false,
```

## Explication technique

1. **`composite: true`** : Active le mode composite TypeScript qui génère des fichiers `.tsbuildinfo` pour optimiser les builds incrémentaux dans les monorepos. Quand désactivé, peut causer des problèmes de résolution de modules entre packages.

2. **`declaration: true`** : Génère les fichiers `.d.ts` de déclaration. Dans un monorepo, ces fichiers sont nécessaires pour que les autres packages puissent correctement typer les imports depuis ce package.

3. **`declarationMap: true`** : Génère les source maps pour les déclarations, permettant aux IDEs de naviguer vers le code source original.

Le problème survient car :
- MikroORM utilise la reflection TypeScript pour découvrir les entités
- Sans les déclarations et le mode composite, la résolution des chemins entre les fichiers compilés (`dist/`) et les sources (`src/`) échoue
- Les metadata TypeScript nécessaires à l'ORM ne sont pas correctement générées/accessibles

## Résolution définitive - Pattern agenda-manager

Après audit du projet `agenda-manager` (qui fonctionne parfaitement), voici le **pattern recommandé** :

### ❌ Ce qu'il faut supprimer
1. **Supprimer `packages/tsconfig/`** - crée une dépendance circulaire inutile
2. **Pas de tsconfig.json racine** - inutile pour pnpm workspace
3. **Pas de `references` complexes** - source de problèmes

### ✅ Pattern qui fonctionne

#### 1. Configuration par package autonome
Chaque `packages/*/tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "esnext",
    "moduleResolution": "bundler",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "baseUrl": "./",
    "rootDir": "./src",
    "outDir": "./dist",

    // ESSENTIEL pour les cross-imports
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### 2. Apps API simple
`apps/api/tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "baseUrl": "./",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "skipLibCheck": true
  }
}
```

#### 3. Package.json avec exports
Chaque package doit avoir :
```json
{
  "name": "@dropit/schemas",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["/dist"]
}
```

#### 4. Cross-imports avec workspace:*
```json
{
  "dependencies": {
    "@dropit/schemas": "workspace:*",
    "@dropit/contract": "workspace:*"
  }
}
```

### Pourquoi ça fonctionne
- **Résolution native pnpm** : `workspace:*` + `exports` field
- **Types automatiques** : `declaration: true` génère les `.d.ts`
- **Pas de références complexes** : chaque package est autonome
- **MikroORM content** : trouve les métadonnées TypeScript correctement

### Migration dropit
1. Supprimer `packages/tsconfig/`
2. Mettre des configs autonomes dans chaque package
3. Ajouter `exports` fields dans les package.json
4. `declaration: true` sur tous les packages partagés