import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ComplexCategoryPresenter } from '../../interface/presenters/complex-category.presenter';
import { IComplexCategoryRepository, COMPLEX_CATEGORY_REPO } from '../ports/complex-category.repository';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { ComplexCategoryMapper } from '../../interface/mappers/complex-category.mapper';
import { CreateComplexCategory, UpdateComplexCategory } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';

@Injectable()
export class ComplexCategoryUseCase {
  constructor(
    @Inject(COMPLEX_CATEGORY_REPO)
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async getOne(complexCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get complex category from repository
      const complexCategory = await this.complexCategoryRepository.getOne(complexCategoryId, organizationId);
      
      if (!complexCategory) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 3. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(complexCategory);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll(organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get complex categories from repository
      const complexCategories = await this.complexCategoryRepository.getAll(organizationId);
      
      // 3. Map complex categories to DTO
      const dtos = ComplexCategoryMapper.toDtoList(complexCategories);
      return ComplexCategoryPresenter.present(dtos);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateComplexCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Validate data
      if (!data.name) {
        throw new BadRequestException('Complex category name is required');
      }

      // 3. Create complex category
      const complexCategory = new ComplexCategory();
      complexCategory.name = data.name;

      // 4. Assign the creator user
      const user = await this.organizationService.getUserById(userId);
      complexCategory.createdBy = user;

      await this.complexCategoryRepository.save(complexCategory);

      // 5. Get created complex category from repository
      const created = await this.complexCategoryRepository.getOne(complexCategory.id, organizationId);

      if (!created) {
        throw new NotFoundException('Complex category not found');
      }

      // 6. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(created);
      
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get complex category to update from repository
      const toUpdate = await this.complexCategoryRepository.getOne(complexCategoryId, organizationId);
      if (!toUpdate) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 3. Update complex category
      if (data.name) {
        toUpdate.name = data.name;
      }

      // 4. Update complex category in repository
      await this.complexCategoryRepository.save(toUpdate);

      // 5. Get updated complex category from repository
      const updated = await this.complexCategoryRepository.getOne(complexCategoryId, organizationId);
      if (!updated) {
        throw new NotFoundException('Updated complex category not found');
      }

      // 6. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(updated);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(complexCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get complex category to delete from repository
      const toDelete = await this.complexCategoryRepository.getOne(complexCategoryId, organizationId);
      if (!toDelete) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 3. Delete complex category
      await this.complexCategoryRepository.remove(toDelete);
      return ComplexCategoryPresenter.presentSuccess('Complex category deleted successfully');
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }
}
