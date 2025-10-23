import { IComplexCategoryRepository } from '../ports/complex-category.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { CreateComplexCategory, UpdateComplexCategory } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';
import { IComplexCategoryUseCases } from '../ports/complex-category-use-cases.port';
import {
  ComplexCategoryNotFoundException,
  ComplexCategoryAccessDeniedException,
  ComplexCategoryValidationException,
} from '../exceptions/complex-category.exceptions';

/**
 * Complex Category Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of complex category business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class ComplexCategoryUseCase implements IComplexCategoryUseCases {
  constructor(
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(complexCategoryId: string, organizationId: string, userId: string): Promise<ComplexCategory> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ComplexCategoryAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get complex category from repository
    const complexCategory = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);

    if (!complexCategory) {
      throw new ComplexCategoryNotFoundException('Complex category not found or access denied');
    }

    return complexCategory;
  }

  async getAll(organizationId: string, userId: string): Promise<ComplexCategory[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ComplexCategoryAccessDeniedException('User is not coach of this organization');
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
      throw new ComplexCategoryAccessDeniedException('User is not coach of this organization');
    }

    // 2. Validate data
    if (!data.name) {
      throw new ComplexCategoryValidationException('Complex category name is required');
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
      throw new ComplexCategoryNotFoundException('Complex category not found');
    }

    return created;
  }

  async update(complexCategoryId: string, data: UpdateComplexCategory, organizationId: string, userId: string): Promise<ComplexCategory> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ComplexCategoryAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get complex category to update from repository
    const toUpdate = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
    if (!toUpdate) {
      throw new ComplexCategoryNotFoundException('Complex category not found or access denied');
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
      throw new ComplexCategoryNotFoundException('Updated complex category not found');
    }

    return updated;
  }

  async delete(complexCategoryId: string, organizationId: string, userId: string): Promise<void> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ComplexCategoryAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get complex category to delete from repository
    const toDelete = await this.complexCategoryRepository.getOne(complexCategoryId, coachFilterConditions);
    if (!toDelete) {
      throw new ComplexCategoryNotFoundException('Complex category not found or access denied');
    }

    // 4. Delete complex category
    await this.complexCategoryRepository.remove(toDelete);
  }
}
