import { complexCategoryContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexCategoryUseCase } from '../../application/use-cases/complex-category.use-cases';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { ComplexCategoryMapper } from '../mappers/complex-category.mapper';
import { ComplexCategoryPresenter } from '../presenters/complex-category.presenter';

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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getComplexCategories>> {
    return tsRestHandler(c.getComplexCategories, async () => {
      try {
        const complexCategories = await this.complexCategoryUseCase.getAll(organizationId, user.id);
        const complexCategoriesDto = ComplexCategoryMapper.toDtoList(complexCategories);
        return ComplexCategoryPresenter.present(complexCategoriesDto);
      } catch (error) {
        return ComplexCategoryPresenter.presentError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getComplexCategory>> {
    return tsRestHandler(c.getComplexCategory, async ({ params }) => {
      try {
        const complexCategory = await this.complexCategoryUseCase.getOne(params.id, organizationId, user.id);
        const complexCategoryDto = ComplexCategoryMapper.toDto(complexCategory);
        return ComplexCategoryPresenter.presentOne(complexCategoryDto);
      } catch (error) {
        return ComplexCategoryPresenter.presentError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createComplexCategory>> {
    return tsRestHandler(c.createComplexCategory, async ({ body }) => {
      try {
        const complexCategory = await this.complexCategoryUseCase.create(body, organizationId, user.id);
        const complexCategoryDto = ComplexCategoryMapper.toDto(complexCategory);
        return ComplexCategoryPresenter.presentOne(complexCategoryDto);
      } catch (error) {
        return ComplexCategoryPresenter.presentCreationError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateComplexCategory>> {
    return tsRestHandler(c.updateComplexCategory, async ({ params, body }) => {
      try {
        const complexCategory = await this.complexCategoryUseCase.update(params.id, body, organizationId, user.id);
        const complexCategoryDto = ComplexCategoryMapper.toDto(complexCategory);
        return ComplexCategoryPresenter.presentOne(complexCategoryDto);
      } catch (error) {
        return ComplexCategoryPresenter.presentError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteComplexCategory>> {
    return tsRestHandler(c.deleteComplexCategory, async ({ params }) => {
      try {
        await this.complexCategoryUseCase.delete(params.id, organizationId, user.id);
        return ComplexCategoryPresenter.presentSuccess('Complex category deleted successfully');
      } catch (error) {
        return ComplexCategoryPresenter.presentError(error as Error);
      }
    });
  }
}
