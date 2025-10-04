import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWorkoutCategoryRepository, WORKOUT_CATEGORY_REPO } from '../ports/workout-category.repository';
import { MEMBER_USE_CASES, IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { USER_USE_CASES, IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { CreateWorkoutCategory, UpdateWorkoutCategory } from '@dropit/schemas';
import { WorkoutCategory } from '../../domain/workout-category.entity';

@Injectable()
export class WorkoutCategoryUseCase {
  constructor(
    @Inject(WORKOUT_CATEGORY_REPO)
    private readonly workoutCategoryRepository: IWorkoutCategoryRepository,
    @Inject(USER_USE_CASES)
    private readonly userUseCases: IUserUseCases,
    @Inject(MEMBER_USE_CASES)
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(workoutCategoryId: string, userId: string, organizationId: string): Promise<WorkoutCategory> {
    // 1. Verify user is a coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ForbiddenException('User is not a coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the workout category
    const workoutCategory = await this.workoutCategoryRepository.getOne(workoutCategoryId, coachFilterConditions);
    if (!workoutCategory) {
      throw new NotFoundException('Workout category not found or access denied');
    }

    return workoutCategory;
  }

  async getAll(userId: string, organizationId: string): Promise<WorkoutCategory[]> {
    // 1. Verify user is a coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ForbiddenException('User is not a coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the workout categories
    const workoutCategories = await this.workoutCategoryRepository.getAll(coachFilterConditions);

    return workoutCategories;
  }

  async create(data: CreateWorkoutCategory, organizationId: string, userId: string): Promise<WorkoutCategory> {
    // 1. Verify user is a coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Validate the data
    if (!data.name) {
      throw new BadRequestException('Workout category name is required');
    }

    // 3. Create the workout category
    const workoutCategory = new WorkoutCategory();
    workoutCategory.name = data.name;

    // 4. Assign the creator user
    const user = await this.userUseCases.getOne(userId);
    workoutCategory.createdBy = user;

    // 5. Save the workout category
    await this.workoutCategoryRepository.save(workoutCategory);

    // 6. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 7. Get the created workout category
    const created = await this.workoutCategoryRepository.getOne(workoutCategory.id, coachFilterConditions);
    if (!created) {
      throw new NotFoundException('Workout category not found');
    }

    return created;
  }

  async update(workoutCategoryId: string, data: UpdateWorkoutCategory, organizationId: string, userId: string): Promise<WorkoutCategory> {
    // 1. Verify user is a coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the workout category to update
    const toUpdate = await this.workoutCategoryRepository.getOne(workoutCategoryId, coachFilterConditions);
    if (!toUpdate) {
      throw new NotFoundException('Workout category not found or access denied');
    }

    // 4. Update the workout category properties
    if (data.name) {
      toUpdate.name = data.name;
    }

    // 5. Save the workout category
    await this.workoutCategoryRepository.save(toUpdate);

    // 6. Get the updated workout category
    const updated = await this.workoutCategoryRepository.getOne(workoutCategoryId, coachFilterConditions);
    if (!updated) {
      throw new NotFoundException('Updated workout category not found');
    }

    return updated;
  }

  async delete(workoutCategoryId: string, organizationId: string, userId: string): Promise<void> {
    // 1. Verify user is a coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the workout category to delete
    const toDelete = await this.workoutCategoryRepository.getOne(workoutCategoryId, coachFilterConditions);
    if (!toDelete) {
      throw new NotFoundException('Workout category not found or access denied');
    }

    // 4. Delete the workout category
    await this.workoutCategoryRepository.remove(toDelete);
  }
}
