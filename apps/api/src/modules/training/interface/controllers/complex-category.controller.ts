import { complexCategoryContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexCategoryUseCase } from '../../application/use-cases/complex-category.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { CurrentUser } from '../../../identity/auth/auth.decorator';

const c = complexCategoryContract;

/**
 * Complex Category Controller
 * 
 * @description
 * Handles all complex category related operations including CRUD operations.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link ComplexCategoryUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ComplexCategoryController {
  constructor(
    private readonly complexCategoryUseCase: ComplexCategoryUseCase
  ) {}

  /**
   * Retrieves all complex categories.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all complex categories.
   */
  @TsRestHandler(c.getComplexCategories)
  @RequirePermissions('read')
  getComplexCategories(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getComplexCategories>> {
    return tsRestHandler(c.getComplexCategories, async () => {
      return await this.complexCategoryUseCase.getAll(organizationId, userId);
    });
  }

  /**
   * Retrieves a specific complex category by ID.
   *
   * @param params - Contains the complex category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The complex category with the specified ID.
   */
  @TsRestHandler(c.getComplexCategory)
  @RequirePermissions('read')
  getComplexCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getComplexCategory>> {
    return tsRestHandler(c.getComplexCategory, async ({ params }) => {
      return await this.complexCategoryUseCase.getOne(params.id, organizationId, userId);
    });
  }

  /**
   * Creates a new complex category.
   *
   * @param body - The complex category data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created complex category.
   */
  @TsRestHandler(c.createComplexCategory)
  @RequirePermissions('create')
  createComplexCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.createComplexCategory>> {
    return tsRestHandler(c.createComplexCategory, async ({ body }) => {
      return await this.complexCategoryUseCase.create(body, organizationId, userId);
    });
  }

  /**
   * Updates an existing complex category.
   *
   * @param params - Contains the complex category ID
   * @param body - The complex category data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated complex category.
   */
  @TsRestHandler(c.updateComplexCategory)
  @RequirePermissions('update')
  updateComplexCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.updateComplexCategory>> {
    return tsRestHandler(c.updateComplexCategory, async ({ params, body }) => {
      return await this.complexCategoryUseCase.update(params.id, body, organizationId, userId);
    });
  }

  /**
   * Deletes a complex category.
   *
   * @param params - Contains the complex category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A success message indicating the complex category was deleted.
   */
  @TsRestHandler(c.deleteComplexCategory)
  @RequirePermissions('delete')
  deleteComplexCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string
  ): ReturnType<typeof tsRestHandler<typeof c.deleteComplexCategory>> {
    return tsRestHandler(c.deleteComplexCategory, async ({ params }) => {
      return await this.complexCategoryUseCase.delete(params.id, organizationId, userId);
    });
  }
}
