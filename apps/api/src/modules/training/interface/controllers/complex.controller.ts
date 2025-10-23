import { complexContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { IComplexUseCases, COMPLEX_USE_CASES } from '../../application/ports/complex-use-cases.port';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { ComplexMapper } from '../mappers/complex.mapper';
import { ComplexPresenter } from '../presenters/complex.presenter';

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
 * @see {@link IComplexUseCases} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ComplexController {
  constructor(
    @Inject(COMPLEX_USE_CASES)
    private readonly complexUseCase: IComplexUseCases
  ) {}

  /**
   * Retrieves all complexes for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all complexes for the organization.
   */
  @TsRestHandler(c.getComplexes)
  @RequirePermissions('read')
  getComplexes(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getComplexes>> {
    return tsRestHandler(c.getComplexes, async () => {
      try {
        const complexes = await this.complexUseCase.getAll(organizationId, user.id);
        const complexesDto = ComplexMapper.toDtoList(complexes);
        return ComplexPresenter.present(complexesDto);
      } catch (error) {
        return ComplexPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves a specific complex by ID.
   *
   * @param params - Contains the complex ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The complex with the specified ID.
   */
  @TsRestHandler(c.getComplex)
  @RequirePermissions('read')
  getComplex(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getComplex>> {
    return tsRestHandler(c.getComplex, async ({ params }) => {
      try {
        const complex = await this.complexUseCase.getOne(params.id, organizationId, user.id);
        const complexDto = ComplexMapper.toDto(complex);
        return ComplexPresenter.presentOne(complexDto);
      } catch (error) {
        return ComplexPresenter.presentError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createComplex>> {
    return tsRestHandler(c.createComplex, async ({ body }) => {
      try {
        const complex = await this.complexUseCase.create(body, organizationId, user.id);
        const complexDto = ComplexMapper.toDto(complex);
        return ComplexPresenter.presentCreationSuccess(complexDto);
      } catch (error) {
        return ComplexPresenter.presentError(error as Error);
      }
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
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateComplex>> {
    return tsRestHandler(c.updateComplex, async ({ params, body }) => {
      try {
        const complex = await this.complexUseCase.update(params.id, body, organizationId, user.id);
        const complexDto = ComplexMapper.toDto(complex);
        return ComplexPresenter.presentOne(complexDto);
      } catch (error) {
        return ComplexPresenter.presentError(error as Error);
      }
    });
  }
}
