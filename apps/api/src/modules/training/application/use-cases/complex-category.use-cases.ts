import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IComplexCategoryRepository, COMPLEX_CATEGORY_REPO } from '../ports/complex-category.repository';
import { MEMBER_USE_CASES, IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { USER_USE_CASES, IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { CreateComplexCategory, UpdateComplexCategory } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';

@Injectable()
export class ComplexCategoryUseCase {
  constructor(
    @Inject(COMPLEX_CATEGORY_REPO)
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    @Inject(USER_USE_CASES)
    private readonly userUseCases: IUserUseCases,
    @Inject(MEMBER_USE_CASES)
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(complexCategoryId: string, organizationId: string, userId: string): Promise<ComplexCategory> {
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

    return complexCategory;
  }

  async getAll(organizationId: string, userId: string): Promise<ComplexCategory[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get complex categories from repository
    const complexCategories = await this.complexCategoryRepository.getAll(coachFilterConditions);

    return complexCategories;
  }

  async create(data: CreateComplexCategory, organizationId: string, userId: string): Promise<ComplexCategory> {
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

    return created;
  }

  async update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string): Promise<ComplexCategory> {
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

    return updated;
  }

  async delete(complexCategoryId: string, organizationId: string, userId: string): Promise<void> {
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
  }
}
