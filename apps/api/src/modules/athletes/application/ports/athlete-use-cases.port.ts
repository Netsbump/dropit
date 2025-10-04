import { CreateAthlete, UpdateAthlete } from '@dropit/schemas';
import { Athlete } from '../../domain/athlete.entity';
import { AthleteDetails } from './athlete.repository';

/**
 * Athlete Use Cases Port
 *
 * @description
 * Defines the contract for athlete business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * AthleteUseCases and injected into controllers via dependency injection.
 */
export interface IAthleteUseCases {
  /**
   * Find one athlete by ID
   */
  findOne(athleteId: string, currentUserId: string, organizationId: string): Promise<Athlete>;

  /**
   * Find one athlete with details (relations populated)
   */
  findOneWithDetails(athleteId: string, currentUserId: string, organizationId: string): Promise<AthleteDetails>;

  /**
   * Find all athletes in organization
   */
  findAll(currentUserId: string, organizationId: string): Promise<Athlete[]>;

  /**
   * Find all athletes with details in organization
   */
  findAllWithDetails(currentUserId: string, organizationId: string): Promise<AthleteDetails[]>;

  /**
   * Create a new athlete
   */
  create(data: CreateAthlete, userId: string): Promise<Athlete>;

  /**
   * Update an existing athlete
   */
  update(idAthlete: string, data: UpdateAthlete, userId: string): Promise<Athlete>;

  /**
   * Delete an athlete
   */
  delete(idAthlete: string, userId: string): Promise<void>;
}

/**
 * Injection token for IAthleteUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_USE_CASES = Symbol('ATHLETE_USE_CASES');
