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
import { AthleteTrainingSessionMapper } from '../mappers/athlete-training-session.mapper';
import { AthleteTrainingSessionPresenter } from '../presenters/athlete-training-session.presenter';

const contractAthleteTrainingSession = apiContract.athleteTrainingSession;

/**
 * Athlete Training Session Controller
 *
 * @description
 * Handles athlete-specific training session operations including viewing assigned sessions
 * and updating athlete notes on sessions.
 *
 * @remarks
 * This controller is separated from TrainingSessionController to handle the athleteTrainingSession
 * resource with proper permissions. Athletes can read and update their own training sessions,
 * while coaches have full access.
 *
 * @see {@link ITrainingSessionUseCases} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class AthleteTrainingSessionController {
  constructor(
    @Inject(TRAINING_SESSION_USE_CASES)
    private readonly trainingSessionUseCase: ITrainingSessionUseCases
  ) {}

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
}
