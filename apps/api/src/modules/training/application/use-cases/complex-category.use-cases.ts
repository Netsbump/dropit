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

  async getOne(complexCategoryId: string) {
    try {
      const complexCategory = await this.complexCategoryRepository.getOne(complexCategoryId);
      if (!complexCategory) {
        throw new NotFoundException('Complex category not found');
      }
      const dto = ComplexCategoryMapper.toDto(complexCategory);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll() {
    try {
      const complexCategories = await this.complexCategoryRepository.getAll();
      const dtos = ComplexCategoryMapper.toDtoList(complexCategories);
      return ComplexCategoryPresenter.present(dtos);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateComplexCategory, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      if (!data.name) {
        throw new BadRequestException('Complex category name is required');
      }

      const complexCategory = new ComplexCategory();
      complexCategory.name = data.name;
      await this.complexCategoryRepository.save(complexCategory);
      const created = await this.complexCategoryRepository.getOne(complexCategory.id);

      if (!created) {
        throw new NotFoundException('Complex category not found');
      }

      const dto = ComplexCategoryMapper.toDto(created);
      
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }
      const toUpdate = await this.complexCategoryRepository.getOne(complexCategoryId);
      if (!toUpdate) {
        throw new NotFoundException('Complex category not found');
      }
      if (data.name) {
        toUpdate.name = data.name;
      }
      await this.complexCategoryRepository.save(toUpdate);
      const updated = await this.complexCategoryRepository.getOne(complexCategoryId);
      if (!updated) {
        throw new NotFoundException('Updated complex category not found');
      }
      const dto = ComplexCategoryMapper.toDto(updated);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(complexCategoryId: string, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }
      const toDelete = await this.complexCategoryRepository.getOne(complexCategoryId);
      if (!toDelete) {
        throw new NotFoundException('Complex category not found');
      }
      await this.complexCategoryRepository.remove(toDelete);
      return ComplexCategoryPresenter.presentSuccess('Complex category deleted successfully');
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }
}
