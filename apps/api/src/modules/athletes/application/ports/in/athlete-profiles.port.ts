import type {
  Athlete,
  AthleteCreation,
  AthleteUpdate,
} from '../../../domain/athlete';
import type { AthleteDetailsReadModel } from '../../read-models/athlete-details.read-model';

export interface IAthleteProfiles {
  findById(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<Athlete>;

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

  listDetailsByOrganization(
    organizationId: string
  ): Promise<AthleteDetailsReadModel[]>;

  create(data: AthleteCreation): Promise<Athlete>;

  updateOwn(
    idAthlete: string,
    data: AthleteUpdate,
    userId: string
  ): Promise<Athlete>;

  deleteOwn(idAthlete: string, userId: string): Promise<void>;

  findIdByUserId(userId: string): Promise<string | null>;
}

/**
 * Injection token for IAthleteProfiles
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');
