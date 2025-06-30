import { complexContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexService } from './complex.service';
import { PermissionsGuard } from '../../permissions/permissions.guard';
import { RequirePermissions } from '../../permissions/permissions.decorator';
import { CurrentOrganization } from '../../members/organization/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../members/auth/auth.decorator';

const c = complexContract;

@Controller()
@UseGuards(PermissionsGuard)
export class ComplexController {
  constructor(private readonly complexService: ComplexService) {}

  @TsRestHandler(c.getComplexes)
  @RequirePermissions('read')
  getComplexes(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getComplexes>> {
    return tsRestHandler(c.getComplexes, async () => {
      try {
        const complexes = await this.complexService.getComplexes(organizationId);

        return {
          status: 200,
          body: complexes,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: {
              message: error.message,
            },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.getComplex)
  @RequirePermissions('read')
  getComplex(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getComplex>> {
    return tsRestHandler(c.getComplex, async ({ params }) => {
      try {
        const complex = await this.complexService.getComplex(params.id, organizationId);
        return {
          status: 200,
          body: complex,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: {
              message: error.message,
            },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.createComplex)
  @RequirePermissions('create')
  createComplex(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createComplex>> {
    return tsRestHandler(c.createComplex, async ({ body }) => {
      try {
        const newComplex = await this.complexService.createComplex(body, organizationId, user.id);
        return {
          status: 201,
          body: newComplex,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: { message: error.message },
          };
        }
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.updateComplex)
  @RequirePermissions('update')
  updateComplex(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.updateComplex>> {
    return tsRestHandler(c.updateComplex, async ({ params, body }) => {
      try {
        const updatedComplex = await this.complexService.updateComplex(
          params.id,
          body,
          organizationId
        );
        return {
          status: 200,
          body: updatedComplex,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }
}
