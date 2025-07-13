import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ComplexCategoryPresenter } from '../../interface/presenters/complex-category.presenter';
import { IComplexCategoryRepository, COMPLEX_CATEGORY_REPO } from '../ports/complex-category.repository';
import { MemberUseCases } from '../../../identity/application/member.use-cases';
import { UserUseCases } from '../../../identity/application/user.use-cases';
import { ComplexCategoryMapper } from '../../interface/mappers/complex-category.mapper';
import { CreateComplexCategory, UpdateComplexCategory } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';

@Injectable()
export class ComplexCategoryUseCase {
  constructor(
    @Inject(COMPLEX_CATEGORY_REPO)
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    private readonly userUseCases: UserUseCases,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getOne(complexCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get complex category from repository
      const complexCategory = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
      
      if (!complexCategory) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 4. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(complexCategory);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll(organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get complex categories from repository
      const complexCategories = await this.complexCategoryRepository.getAll(coachFilterConditions);
      
      // 4. Map complex categories to DTO
      const dtos = ComplexCategoryMapper.toDtoList(complexCategories);
      return ComplexCategoryPresenter.present(dtos);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateComplexCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
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
      const user = await this.userUseCases.getOne(userId);
      complexCategory.createdBy = user;

      await this.complexCategoryRepository.save(complexCategory);

      // 5. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 6. Get created complex category from repository
      const created = await this.complexCategoryRepository.getOne(complexCategory.id, coachFilterConditions);

      if (!created) {
        throw new NotFoundException('Complex category not found');
      }

      // 7. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(created);
      
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get complex category to update from repository
      const toUpdate = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
      if (!toUpdate) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 4. Update complex category
      if (data.name) {
        toUpdate.name = data.name;
      }

      // 5. Update complex category in repository
      await this.complexCategoryRepository.save(toUpdate);

      // 6. Get updated complex category from repository
      const updated = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
      if (!updated) {
        throw new NotFoundException('Updated complex category not found');
      }

      // 7. Map complex category to DTO
      const dto = ComplexCategoryMapper.toDto(updated);
      return ComplexCategoryPresenter.presentOne(dto);
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(complexCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get complex category to delete from repository
      const toDelete = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
      if (!toDelete) {
        throw new NotFoundException('Complex category not found or access denied');
      }

      // 4. Delete complex category
      await this.complexCategoryRepository.remove(toDelete);
      return ComplexCategoryPresenter.presentSuccess('Complex category deleted successfully');
    } catch (error) {
      return ComplexCategoryPresenter.presentError(error as Error);
    }
  }
}
