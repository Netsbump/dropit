/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ProgramsImport } from './routes/programs'
import { Route as PlanningImport } from './routes/planning'
import { Route as AthletesImport } from './routes/athletes'
import { Route as programsImport } from './routes/__programs'
import { Route as ProgramsWorkoutsImport } from './routes/programs.workouts'
import { Route as ProgramsExercisesImport } from './routes/programs.exercises'
import { Route as ProgramsComplexImport } from './routes/programs.complex'

// Create Virtual Routes

const AboutLazyImport = createFileRoute('/about')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const AboutLazyRoute = AboutLazyImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const ProgramsRoute = ProgramsImport.update({
  id: '/programs',
  path: '/programs',
  getParentRoute: () => rootRoute,
} as any)

const PlanningRoute = PlanningImport.update({
  id: '/planning',
  path: '/planning',
  getParentRoute: () => rootRoute,
} as any)

const AthletesRoute = AthletesImport.update({
  id: '/athletes',
  path: '/athletes',
  getParentRoute: () => rootRoute,
} as any)

const programsRoute = programsImport.update({
  id: '/__programs',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ProgramsWorkoutsRoute = ProgramsWorkoutsImport.update({
  id: '/workouts',
  path: '/workouts',
  getParentRoute: () => ProgramsRoute,
} as any)

const ProgramsExercisesRoute = ProgramsExercisesImport.update({
  id: '/exercises',
  path: '/exercises',
  getParentRoute: () => ProgramsRoute,
} as any)

const ProgramsComplexRoute = ProgramsComplexImport.update({
  id: '/complex',
  path: '/complex',
  getParentRoute: () => ProgramsRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/__programs': {
      id: '/__programs'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof programsImport
      parentRoute: typeof rootRoute
    }
    '/athletes': {
      id: '/athletes'
      path: '/athletes'
      fullPath: '/athletes'
      preLoaderRoute: typeof AthletesImport
      parentRoute: typeof rootRoute
    }
    '/planning': {
      id: '/planning'
      path: '/planning'
      fullPath: '/planning'
      preLoaderRoute: typeof PlanningImport
      parentRoute: typeof rootRoute
    }
    '/programs': {
      id: '/programs'
      path: '/programs'
      fullPath: '/programs'
      preLoaderRoute: typeof ProgramsImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutLazyImport
      parentRoute: typeof rootRoute
    }
    '/programs/complex': {
      id: '/programs/complex'
      path: '/complex'
      fullPath: '/programs/complex'
      preLoaderRoute: typeof ProgramsComplexImport
      parentRoute: typeof ProgramsImport
    }
    '/programs/exercises': {
      id: '/programs/exercises'
      path: '/exercises'
      fullPath: '/programs/exercises'
      preLoaderRoute: typeof ProgramsExercisesImport
      parentRoute: typeof ProgramsImport
    }
    '/programs/workouts': {
      id: '/programs/workouts'
      path: '/workouts'
      fullPath: '/programs/workouts'
      preLoaderRoute: typeof ProgramsWorkoutsImport
      parentRoute: typeof ProgramsImport
    }
  }
}

// Create and export the route tree

interface ProgramsRouteChildren {
  ProgramsComplexRoute: typeof ProgramsComplexRoute
  ProgramsExercisesRoute: typeof ProgramsExercisesRoute
  ProgramsWorkoutsRoute: typeof ProgramsWorkoutsRoute
}

const ProgramsRouteChildren: ProgramsRouteChildren = {
  ProgramsComplexRoute: ProgramsComplexRoute,
  ProgramsExercisesRoute: ProgramsExercisesRoute,
  ProgramsWorkoutsRoute: ProgramsWorkoutsRoute,
}

const ProgramsRouteWithChildren = ProgramsRoute._addFileChildren(
  ProgramsRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '': typeof programsRoute
  '/athletes': typeof AthletesRoute
  '/planning': typeof PlanningRoute
  '/programs': typeof ProgramsRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/programs/complex': typeof ProgramsComplexRoute
  '/programs/exercises': typeof ProgramsExercisesRoute
  '/programs/workouts': typeof ProgramsWorkoutsRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '': typeof programsRoute
  '/athletes': typeof AthletesRoute
  '/planning': typeof PlanningRoute
  '/programs': typeof ProgramsRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/programs/complex': typeof ProgramsComplexRoute
  '/programs/exercises': typeof ProgramsExercisesRoute
  '/programs/workouts': typeof ProgramsWorkoutsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/__programs': typeof programsRoute
  '/athletes': typeof AthletesRoute
  '/planning': typeof PlanningRoute
  '/programs': typeof ProgramsRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/programs/complex': typeof ProgramsComplexRoute
  '/programs/exercises': typeof ProgramsExercisesRoute
  '/programs/workouts': typeof ProgramsWorkoutsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/athletes'
    | '/planning'
    | '/programs'
    | '/about'
    | '/programs/complex'
    | '/programs/exercises'
    | '/programs/workouts'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/athletes'
    | '/planning'
    | '/programs'
    | '/about'
    | '/programs/complex'
    | '/programs/exercises'
    | '/programs/workouts'
  id:
    | '__root__'
    | '/'
    | '/__programs'
    | '/athletes'
    | '/planning'
    | '/programs'
    | '/about'
    | '/programs/complex'
    | '/programs/exercises'
    | '/programs/workouts'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  programsRoute: typeof programsRoute
  AthletesRoute: typeof AthletesRoute
  PlanningRoute: typeof PlanningRoute
  ProgramsRoute: typeof ProgramsRouteWithChildren
  AboutLazyRoute: typeof AboutLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  programsRoute: programsRoute,
  AthletesRoute: AthletesRoute,
  PlanningRoute: PlanningRoute,
  ProgramsRoute: ProgramsRouteWithChildren,
  AboutLazyRoute: AboutLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/__programs",
        "/athletes",
        "/planning",
        "/programs",
        "/about"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/__programs": {
      "filePath": "__programs.tsx"
    },
    "/athletes": {
      "filePath": "athletes.tsx"
    },
    "/planning": {
      "filePath": "planning.tsx"
    },
    "/programs": {
      "filePath": "programs.tsx",
      "children": [
        "/programs/complex",
        "/programs/exercises",
        "/programs/workouts"
      ]
    },
    "/about": {
      "filePath": "about.lazy.tsx"
    },
    "/programs/complex": {
      "filePath": "programs.complex.tsx",
      "parent": "/programs"
    },
    "/programs/exercises": {
      "filePath": "programs.exercises.tsx",
      "parent": "/programs"
    },
    "/programs/workouts": {
      "filePath": "programs.workouts.tsx",
      "parent": "/programs"
    }
  }
}
ROUTE_MANIFEST_END */
