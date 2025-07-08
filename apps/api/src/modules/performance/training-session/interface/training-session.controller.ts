import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { TrainingSessionService } from '../application/training-session.service';
import { TrainingSessionUseCase } from './../application/training-session.use-case';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermissions } from '../../../permissions/permissions.decorator';
import { CurrentOrganization } from '../../../members/organization/organization.decorator';
import { CurrentUser } from '../../../members/auth/auth.decorator';

const c = apiContract.trainingSession;

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
    private readonly trainingSessionService: TrainingSessionService,
    private readonly trainingSessionUseCase: TrainingSessionUseCase
  ) {}

  @TsRestHandler(c.getTrainingSessions)
  @RequirePermissions('read')
  getTrainingSessions(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getTrainingSessions>> {
    return tsRestHandler(c.getTrainingSessions, async () => {
      return await this.trainingSessionUseCase.getAll(organizationId);
    });
  }

  @TsRestHandler(c.getTrainingSession)
  @RequirePermissions('read')
  getTrainingSession(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getTrainingSession>> {
    return tsRestHandler(c.getTrainingSession, async ({ params }) => {
      return await this.trainingSessionUseCase.getOne(params.id, organizationId);
    });
  }

/**
 * Creates a new training session for the current organization.
 *
 * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
 * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
 * @returns The newly created training session.
 */
  @TsRestHandler(c.createTrainingSession)
  @RequirePermissions('create')
  createTrainingSession(@CurrentOrganization() organizationId: string, @CurrentUser() userId: string): ReturnType<typeof tsRestHandler<typeof c.createTrainingSession>> {
    return tsRestHandler(c.createTrainingSession, async ({ body }) => {
      return this.trainingSessionUseCase.createOne(body, organizationId, userId);
    });
  }

  @TsRestHandler(c.getTrainingSessionsByAthlete)
  @RequirePermissions('read')
  /*
   * Get all training sessions by athlete
   * @param organizationId - The organization id
   * @param athleteId - The athlete id
   * @returns The training sessions
  */
  getTrainingSessionsByAthlete(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getTrainingSessionsByAthlete>> {
    return tsRestHandler(c.getTrainingSessionsByAthlete, async ({ params }) => {
      try {
        const trainingSessions = await this.trainingSessionService.getTrainingSessionsByAthlete(
          params.athleteId,
          organizationId
        );
        return { status: 200, body: trainingSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getTrainingSessionByAthlete)
  @RequirePermissions('read')
  /*
   * Get one training session by athlete
   * @param organizationId - The organization id
   * @param id - The training session id
   * @returns The training session
  */
  getTrainingSessionByAthlete(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getTrainingSessionByAthlete>> {
    return tsRestHandler(c.getTrainingSessionByAthlete, async ({ params }) => {
      return this.trainingSessionUseCase.getOneByAthlete(params.id, organizationId);
    });
  }



  @TsRestHandler(c.updateTrainingSession)
  @RequirePermissions('update')
  /*
   * Update a training session
   * @param organizationId - The organization id
   * @param id - The training session id
   * @param body - The training session data
   * @returns The updated training session
  */
  updateTrainingSession(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.updateTrainingSession>> {
    return tsRestHandler(c.updateTrainingSession, async ({ params, body }) => {
      try {
        const updatedTrainingSession = await this.trainingSessionService.updateTrainingSession(
          params.id,
          body,
          organizationId
        );
        return { status: 200, body: updatedTrainingSession };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return { status: 400, body: { message: error.message } };
        }
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.updateTrainingSessionAthlete)
  @RequirePermissions('update')
  /*
   * Update a training session by athlete
   * @param organizationId - The organization id
   * @param id - The training session id
   * @param body - The training session data
   * @returns The updated training session
  */
  updateTrainingSessionAthlete(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.updateTrainingSessionAthlete>> {
    return tsRestHandler(c.updateTrainingSessionAthlete, async ({ params, body }) => {
      return this.trainingSessionService.updateTrainingSessionAthlete(params.id, body, organizationId);
    });
  }

  @TsRestHandler(c.updateAthleteNotes)
  @RequirePermissions('update')
  /*
   * Update athlete notes
   * @param organizationId - The organization id
   * @param id - The training session id  
   * @param body - The training session data
   * @returns The updated training session
  */
  updateAthleteNotes(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.updateAthleteNotes>> {
    return tsRestHandler(c.updateAthleteNotes, async ({ params, body }) => {
      return this.trainingSessionService.updateAthleteNotes(params.id, body, organizationId);
    });
  }

  @TsRestHandler(c.completeTrainingSession)
  @RequirePermissions('update')
  /*
   * Complete a training session
   * @param organizationId - The organization id
   * @param id - The training session id
   * @param body - The training session data
   * @returns The completed training session
  */
  completeTrainingSession(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.completeTrainingSession>> {
    return tsRestHandler(c.completeTrainingSession, async ({ params, body }) => {
      try {
        const completedTrainingSession = await this.trainingSessionService.completeTrainingSession(
          params.id,
          organizationId,
          body.completedDate
        );
        return { status: 200, body: completedTrainingSession };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }   

  @TsRestHandler(c.deleteTrainingSession) 
  @RequirePermissions('delete')
  /*
   * Delete a training session
   * @param organizationId - The organization id
   * @param id - The training session id
   * @returns The deleted training session
  */
    deleteTrainingSession(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.deleteTrainingSession>> {
    return tsRestHandler(c.deleteTrainingSession, async ({ params }) => {
      try {
        await this.trainingSessionService.deleteTrainingSession(params.id, organizationId);
        return {
          status: 200,
          body: { message: 'TrainingSession deleted successfully' },
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }
}
