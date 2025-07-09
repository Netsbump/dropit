import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, ownerAc, adminAc, memberAc } from 'better-auth/plugins/organization/access';

/**
 * Définition des ressources et actions pour notre application
 */
const statement = {
  // Ressources par défaut de Better Auth
  ...defaultStatements,
  
  // Mes ressources métier
  workout: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
} as const;

/**
 * Création du contrôleur d'accès
 */
export const ac = createAccessControl(statement);

/**
 * Définition des rôles
 */

// Rôle Member (lecture seule + création de ses propres records)
export const member = ac.newRole({
  ...memberAc.statements,
  workout: ["read"],
  exercise: ["read"],
  complex: ["read"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read"],
  personalRecord: ["read", "create"],
  trainingSession: ["read"],
  athleteTrainingSession: ["read", "update"],
});

// Rôle Admin (gestion complète sauf suppression d'organisation)
export const admin = ac.newRole({
  ...adminAc.statements,
  workout: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
});

// Rôle Owner (toutes les permissions)
export const owner = ac.newRole({
  ...ownerAc.statements,
  workout: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
});

