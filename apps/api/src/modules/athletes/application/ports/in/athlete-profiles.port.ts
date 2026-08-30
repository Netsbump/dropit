import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';
import type { SearchablePaginationQuery } from '../../../../../shared/kernel/pagination';
import type {
  Athlete,
  AthleteCreation,
  AthleteUpdate,
} from '../../../domain/athlete';
import type { AthleteId } from '../../../domain/athlete-id';
import type {
  AthleteDetailsReadModel,
  PaginatedAthleteDetailsReadModel,
} from '../../models/athlete-details.read-model';

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
    organizationId: OrganizationId,
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel>;

  listDetailsByOrganization(
    organizationId: OrganizationId,
    query: SearchablePaginationQuery
  ): Promise<PaginatedAthleteDetailsReadModel>;

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
