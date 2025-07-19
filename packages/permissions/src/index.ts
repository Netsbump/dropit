import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, ownerAc, adminAc, memberAc } from 'better-auth/plugins/organization/access';

/**
 * Definition of resources and actions for our application
 */
const statement = {
  // Default resources of Better Auth
  ...defaultStatements,
  
  // My business resources
  workout: ["read", "create", "update", "delete"],
  workoutCategory: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  exerciseCategory: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  complexCategory: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
  competitorStatus: ["read", "create", "update"],
  invitation: ["read", "create", "update", "delete"],
} as const;

/**
 * Creation of access controller and definition of roles
 */
export const ac = createAccessControl(statement);

// Role Member (Athlete)
export const member = ac.newRole({
  ...memberAc.statements,
  athlete: ["read", "create", "update", "delete"],
  session: ["read"],
  personalRecord: ["read", "create"],
  trainingSession: ["read"],
  athleteTrainingSession: ["read", "update"],
  competitorStatus: ["read"],
  invitation: ["read"],
});

// Role Admin (Coach)
export const admin = ac.newRole({
  ...adminAc.statements,
  workout: ["read", "create", "update", "delete"],
  workoutCategory: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  exerciseCategory: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  complexCategory: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
  competitorStatus: ["read", "create", "update"],
  invitation: ["read", "create", "update", "delete"],
});

// Role Owner (All permissions)
export const owner = ac.newRole({
  ...ownerAc.statements,
  workout: ["read", "create", "update", "delete"],
  workoutCategory: ["read", "create", "update", "delete"],
  exercise: ["read", "create", "update", "delete"],
  exerciseCategory: ["read", "create", "update", "delete"],
  complex: ["read", "create", "update", "delete"],
  complexCategory: ["read", "create", "update", "delete"],
  athlete: ["read", "create", "update", "delete"],
  session: ["read", "create", "update", "delete"],
  personalRecord: ["read", "create", "update", "delete"],
  trainingSession: ["read", "create", "update", "delete"],
  athleteTrainingSession: ["read", "update"],
  competitorStatus: ["read", "create", "update"],
  invitation: ["read", "create", "update", "delete"],
});

