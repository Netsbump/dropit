import { apiContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { TrainingSessionUseCase } from '../application/use-cases/training-session.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { CurrentUser } from '../../../identity/auth/auth.decorator';

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
 * @see {@link TrainingSessionUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionUseCase: TrainingSessionUseCase
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
      return await this.trainingSessionUseCase.getAll(organizationId);
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
      return await this.trainingSessionUseCase.getOne(params.id, organizationId);
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
  getAthleteTrainingSessions(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.getAthleteTrainingSessions>> {
    return tsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSessions, async ({ params }) => {
      return await this.trainingSessionUseCase.getAthleteTrainingSessions(params.athleteId, organizationId, userId);
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
  getAthleteTrainingSession(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.getAthleteTrainingSession>> {
    return tsRestHandler(contractAthleteTrainingSession.getAthleteTrainingSession, async ({ params }) => {
      return await this.trainingSessionUseCase.getOneAthleteTrainingSession(params.trainingSessionId, params.athleteId, organizationId, userId);
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
  createTrainingSession(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.createTrainingSession>> {
    return tsRestHandler(contractTrainingSession.createTrainingSession, async ({ body }) => {
      return await this.trainingSessionUseCase.create(body, organizationId, userId);
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
  updateTrainingSession(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.updateTrainingSession>> {
    return tsRestHandler(contractTrainingSession.updateTrainingSession, async ({ params, body }) => {
      return await this.trainingSessionUseCase.update(params.id, body, organizationId, userId);
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
  updateAthleteTrainingSession(@CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractAthleteTrainingSession.updateAthleteTrainingSession>> {
    return tsRestHandler(contractAthleteTrainingSession.updateAthleteTrainingSession, async ({ params, body }) => {
      return this.trainingSessionUseCase.updateAthleteTrainingSession(params.athleteId, params.trainingSessionId, body, userId);
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
    deleteTrainingSession(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof contractTrainingSession.deleteTrainingSession>> {
    return tsRestHandler(contractTrainingSession.deleteTrainingSession, async ({ params }) => {
      return await this.trainingSessionUseCase.delete(params.id, organizationId, userId);
    });
  }
}
