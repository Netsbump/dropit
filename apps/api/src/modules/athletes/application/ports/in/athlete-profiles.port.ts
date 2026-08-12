import type {
  Athlete,
  AthleteCreation,
  AthleteUpdate,
} from '../../../domain/athlete';
import type { AthleteDetailsReadModel } from '../../read-models/athlete-details.read-model';

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
   * Find an accessible athlete profile by ID
   */
  findById(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete>;

  /**
   * Find accessible athlete profile details by ID
   */
  findDetailsById(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel>;

  /**
   * List athlete profiles accessible to the current user
   */
  listAccessible(
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete[]>;

  /**
   * List athlete profile details accessible to the current user
   */
  listAccessibleDetails(
    currentUserId: string,
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]>;

  /**
   * List athlete profile details for a given organization (super admin)
   */
  listDetailsByOrganization(
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]>;

  /**
   * Create a new athlete
   */
  create(data: AthleteCreation): Promise<Athlete>;

  /**
   * Update the current user's own athlete profile
   */
  updateOwn(
    idAthlete: string,
    data: AthleteUpdate,
    userId: string
  ): Promise<Athlete>;

  /**
   * Delete the current user's own athlete profile
   */
  deleteOwn(idAthlete: string, userId: string): Promise<void>;

  /**
   * Find the athlete profile ID for a given user, null if no athlete profile exists
   */
  findIdByUserId(userId: string): Promise<string | null>;
}

/**
 * Injection token for IAthleteProfiles
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');
