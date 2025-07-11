import { complexContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexUseCase } from '../../application/use-cases/complex.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { CurrentUser } from '../../../identity/auth/auth.decorator';

const c = complexContract;

/**
 * Complex Controller
 * 
 * @description
 * Handles all complex related operations including CRUD operations.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link ComplexUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ComplexController {
  constructor(
    private readonly complexUseCase: ComplexUseCase
  ) {}

  /**
   * Retrieves all complexes for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all complexes for the organization.
   */
  @TsRestHandler(c.getComplexes)
  @RequirePermissions('read')
  getComplexes(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getComplexes>> {
    return tsRestHandler(c.getComplexes, async () => {
      return await this.complexUseCase.getAll(organizationId);
    });
  }

  /**
   * Retrieves a specific complex by ID.
   *
   * @param params - Contains the complex ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The complex with the specified ID.
   */
  @TsRestHandler(c.getComplex)
  @RequirePermissions('read')
  getComplex(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getComplex>> {
    return tsRestHandler(c.getComplex, async ({ params }) => {
      return await this.complexUseCase.getOne(params.id, organizationId);
    });
  }

  /**
   * Creates a new complex.
   *
   * @param body - The complex data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created complex.
   */
  @TsRestHandler(c.createComplex)
  @RequirePermissions('create')
  createComplex(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.createComplex>> {
    return tsRestHandler(c.createComplex, async ({ body }) => {
      return await this.complexUseCase.create(body, organizationId, userId);
    });
  }

  /**
   * Updates an existing complex.
   *
   * @param params - Contains the complex ID
   * @param body - The complex data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated complex.
   */
  @TsRestHandler(c.updateComplex)
  @RequirePermissions('update')
  updateComplex(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.updateComplex>> {
    return tsRestHandler(c.updateComplex, async ({ params, body }) => {
      return await this.complexUseCase.update(params.id, body, organizationId, userId);
    });
  }


}
