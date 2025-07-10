import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { CreateAthleteUseCase } from '../application/use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from '../application/use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from '../application/use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from '../application/use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from '../application/use-cases/update-athlete.use-case';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { NoOrganization, RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/auth/auth.decorator';

const c = apiContract.athlete;

@Controller()
@UseGuards(PermissionsGuard)
export class AthleteController {
  constructor(
    private readonly getAthletesUseCase: GetAthletesUseCase,
    private readonly getAthleteUseCase: GetAthleteUseCase,
    private readonly createAthleteUseCase: CreateAthleteUseCase,
    private readonly updateAthleteUseCase: UpdateAthleteUseCase,
    private readonly deleteAthleteUseCase: DeleteAthleteUseCase
  ) {}

  // ──────────────────────────────── GET /athlete
  @TsRestHandler(c.getAthletes)
  @RequirePermissions('read')
  getAthletes(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getAthletes>> {
    return tsRestHandler(c.getAthletes, async () => {
      try {
        const athletes = await this.getAthletesUseCase.findAllWithDetails(organizationId);
        return { status: 200, body: athletes };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── GET /athlete/:id
  @TsRestHandler(c.getAthlete)
  @RequirePermissions('read')
  getAthlete(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getAthlete>> {
    return tsRestHandler(c.getAthlete, async ({ params }) => {
      try {
        const athlete = await this.getAthleteUseCase.findOneWithDetails(params.id, organizationId);
        return { status: 200, body: athlete };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── POST /athlete
  @TsRestHandler(c.createAthlete)
  @RequirePermissions('create')
  @NoOrganization()
  createAthlete(    
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createAthlete>> {
    return tsRestHandler(c.createAthlete, async ({ body }) => {
      try {
        const newAthlete = await this.createAthleteUseCase.execute(body, user.id);
        return { status: 201, body: newAthlete };
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

  // ──────────────────────────────── PATCH /athlete/:id
  @TsRestHandler(c.updateAthlete)
  @RequirePermissions('update')
  @NoOrganization()
  updateAthlete(@CurrentUser() user: AuthenticatedUser): ReturnType<typeof tsRestHandler<typeof c.updateAthlete>> {
    return tsRestHandler(c.updateAthlete, async ({ params, body }) => {
      try {
        const updated = await this.updateAthleteUseCase.execute(
          params.id,
          body,
          user.id
        );
        return { status: 200, body: updated };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── DELETE /athlete/:id
  @TsRestHandler(c.deleteAthlete)
  @RequirePermissions('delete')
  deleteAthlete(@CurrentUser() user: AuthenticatedUser): ReturnType<typeof tsRestHandler<typeof c.deleteAthlete>> {
    return tsRestHandler(c.deleteAthlete, async ({ params }) => {
      try {
        await this.deleteAthleteUseCase.execute(params.id, user.id);
        return {
          status: 204,
          body: null,
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
