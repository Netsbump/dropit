import { apiContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ITrainingSessionUseCases, TRAINING_SESSION_USE_CASES } from '../../application/ports/training-session-use-cases.port';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { TrainingSessionMapper } from '../mappers/training-session.mapper';
import { TrainingSessionPresenter } from '../presenters/training-session.presenter';
import { AthleteTrainingSessionMapper } from '../mappers/athlete-training-session.mapper';
import { AthleteTrainingSessionPresenter } from '../presenters/athlete-training-session.presenter';

const contractTrainingSession = apiContract.trainingSession;
const contractAthleteTrainingSession = apiContract.athleteTrainingSession;

/**
 * Training Session Controller
 * 
 * @description
 * Handles all training session related operations including CRUD operations,
 * athlete-specific operations, and session completion workflows.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link ITrainingSessionUseCases} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class TrainingSessionController {
  constructor(
    @Inject(TRAINING_SESSION_USE_CASES)
    private readonly trainingSessionUseCase: ITrainingSessionUseCases
  ) {}

  /**
   * Retrieves all training sessions for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all training sessions for the organization.
   */
  @TsRestHandler(contractTrainingSession.getTrainingSessions)
  @RequirePermissions('read')
  getTrainingSessions(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.getTrainingSessions>> {
    return tsRestHandler(contractTrainingSession.getTrainingSessions, async () => {
      try {
        const trainingSessions = await this.trainingSessionUseCase.getAll(organizationId);
        const trainingSessionsDto = TrainingSessionMapper.toDtoList(trainingSessions);
        return TrainingSessionPresenter.present(trainingSessionsDto);
      } catch (error) {
        return TrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves a specific training session by ID for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The training session with the specified ID.
   */
  @TsRestHandler(contractTrainingSession.getTrainingSession)
  @RequirePermissions('read')
  getTrainingSession(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.getTrainingSession>> {
    return tsRestHandler(contractTrainingSession.getTrainingSession, async ({ params }) => {
      try {
        const trainingSession = await this.trainingSessionUseCase.getOne(params.id, organizationId);
        const trainingSessionDto = TrainingSessionMapper.toDto(trainingSession);
        return TrainingSessionPresenter.presentOne(trainingSessionDto);
      } catch (error) {
        return TrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves all training sessions for a specific athlete within the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of training sessions for the specified athlete.
   */
  @TsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSessions)
  @RequirePermissions('read')
  getAthleteTrainingSessions(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.getAthleteTrainingSessions>> {
    return tsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSessions, async ({ params }) => {
      try {
        const athleteTrainingSessions = await this.trainingSessionUseCase.getAthleteTrainingSessions(params.athleteId, organizationId, user.id);
        const athleteTrainingSessionsDto = AthleteTrainingSessionMapper.toDtoList(athleteTrainingSessions);
        return AthleteTrainingSessionPresenter.present(athleteTrainingSessionsDto);
      } catch (error) {
        return AthleteTrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves a specific training session for a specific athlete within the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The specific training session for the specified athlete.
   */
  @TsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSession)
  @RequirePermissions('read')
  getAthleteTrainingSession(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.getAthleteTrainingSession>> {
    return tsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSession, async ({ params }) => {
      try {
        const athleteTrainingSession = await this.trainingSessionUseCase.getOneAthleteTrainingSession(params.trainingSessionId, params.athleteId, organizationId, user.id);
        const athleteTrainingSessionDto = AthleteTrainingSessionMapper.toDto(athleteTrainingSession);
        return AthleteTrainingSessionPresenter.presentOne(athleteTrainingSessionDto);
      } catch (error) {
        return AthleteTrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Creates a new training session for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created training session.
  */
  @TsRestHandler(contractTrainingSession.createTrainingSession)
  @RequirePermissions('create')
  createTrainingSession(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.createTrainingSession>> {
    return tsRestHandler(contractTrainingSession.createTrainingSession, async ({ body }) => {
      try {
        const trainingSession = await this.trainingSessionUseCase.create(body, organizationId, user.id);
        const trainingSessionDto = TrainingSessionMapper.toDto(trainingSession);
        return TrainingSessionPresenter.presentOne(trainingSessionDto);
      } catch (error) {
        return TrainingSessionPresenter.presentCreationError(error as Error);
      }
    });
  }

  /**
   * Updates an existing training session for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated training session.
   */
  @TsRestHandler(contractTrainingSession.updateTrainingSession)
  @RequirePermissions('update')
  updateTrainingSession(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.updateTrainingSession>> {
    return tsRestHandler(contractTrainingSession.updateTrainingSession, async ({ params, body }) => {
      try {
        const trainingSession = await this.trainingSessionUseCase.update(params.id, body, organizationId, user.id);
        const trainingSessionDto = TrainingSessionMapper.toDto(trainingSession);
        return TrainingSessionPresenter.presentOne(trainingSessionDto);
      } catch (error) {
        return TrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Updates a specific training session for a specific athlete.
   *
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated athlete training session.
   */
  @TsRestHandler(contractAthleteTrainingSession.updateAthleteTrainingSession)
  @RequirePermissions('update')
  updateAthleteTrainingSession(
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.updateAthleteTrainingSession>> {
    return tsRestHandler(contractAthleteTrainingSession.updateAthleteTrainingSession, async ({ params, body }) => {
      try {
        const athleteTrainingSession = await this.trainingSessionUseCase.updateAthleteTrainingSession(params.athleteId, params.trainingSessionId, body, user.id);
        const athleteTrainingSessionDto = AthleteTrainingSessionMapper.toDto(athleteTrainingSession);
        return AthleteTrainingSessionPresenter.presentOne(athleteTrainingSessionDto);
      } catch (error) {
        return AthleteTrainingSessionPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Deletes a training session for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns Confirmation of the deletion operation.
   */
  @TsRestHandler(contractTrainingSession.deleteTrainingSession)
  @RequirePermissions('delete')
  deleteTrainingSession(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.deleteTrainingSession>> {
    return tsRestHandler(contractTrainingSession.deleteTrainingSession, async ({ params }) => {
      try {
        await this.trainingSessionUseCase.delete(params.id, organizationId, user.id);
        return TrainingSessionPresenter.presentSuccess('Training session deleted successfully');
      } catch (error) {
        return TrainingSessionPresenter.presentError(error as Error);
      }
    });
  }
}
