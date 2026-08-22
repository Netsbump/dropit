import type { AthleteId } from '../../../domain/athlete-id';
import type {
  Athlete,
  AthleteCreation,
  AthleteUpdate,
} from '../../../domain/athlete';
import type { AthleteDetailsReadModel } from '../../read-models/athlete-details.read-model';
import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';

export interface IAthleteProfiles {
  findById(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<Athlete>;

  findDetailsById(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<AthleteDetailsReadModel>;

  /**
   * List athlete profiles accessible to the current user
   */
  listAccessible(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<Athlete[]>;

  /**
   * List athlete profile details accessible to the current user
   */
  listAccessibleDetails(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<AthleteDetailsReadModel[]>;

  listDetailsByOrganization(
    organizationId: OrganizationId
  ): Promise<AthleteDetailsReadModel[]>;

  create(data: AthleteCreation): Promise<Athlete>;

  updateOwn(
    athleteId: AthleteId,
    data: AthleteUpdate,
    userId: UserId
  ): Promise<Athlete>;

  deleteOwn(athleteId: AthleteId, userId: UserId): Promise<void>;

  findIdByUserId(userId: UserId): Promise<string | null>;
}

/**
 * Injection token for IAthleteProfiles
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_PROFILES = Symbol('ATHLETE_PROFILES');
