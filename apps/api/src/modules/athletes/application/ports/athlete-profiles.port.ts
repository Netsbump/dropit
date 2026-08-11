import type {
  Athlete,
  AthleteCreation,
  AthleteUpdate,
} from '../../domain/athlete';
import type { AthleteDetailsReadModel } from '../read-models/athlete-details.read-model';

/**
 * Athlete Profiles Port
 *
 * @description
 * Defines the contract for athlete business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * AthleteProfiles and injected into controllers via dependency injection.
 */
export interface IAthleteProfiles {
  /**
   * Find one athlete by ID
   */
  findOne(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete>;

  /**
   * Find one athlete with details (relations populated)
   */
  findOneWithDetails(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel>;

  /**
   * Find all athletes in organization
   */
  findAll(currentUserId: string, organizationId: string): Promise<Athlete[]>;

  /**
   * Find all athletes with details in organization
   */
  findAllWithDetails(
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]>;

  /**
   * Find all athletes with details for a given organization (super admin)
   */
  findAllWithDetailsByOrganization(
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]>;

  /**
   * Create a new athlete
   */
  create(data: AthleteCreation): Promise<Athlete>;

  /**
   * Update an existing athlete
   */
  update(
    idAthlete: string,
    data: AthleteUpdate,
    userId: string
  ): Promise<Athlete>;

  /**
   * Delete an athlete
   */
  delete(idAthlete: string, userId: string): Promise<void>;

  /**
   * Get the athlete ID for a given user, null if no athlete profile exists
   */
  getAthleteId(userId: string): Promise<string | null>;
}

/**
 * Injection token for IAthleteProfiles
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');
