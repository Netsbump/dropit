import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutCategoryPresenter } from '../../interface/presenters/workout-category.presenter';
import { IWorkoutCategoryRepository, WORKOUT_CATEGORY_REPO } from '../ports/workout-category.repository';
import { MemberUseCases } from '../../../identity/application/member.use-cases';
import { UserUseCases } from '../../../identity/application/user.use-cases';
import { WorkoutCategoryMapper } from '../../interface/mappers/workout-category.mapper';
import { CreateWorkoutCategory, UpdateWorkoutCategory } from '@dropit/schemas';
import { WorkoutCategory } from '../../domain/workout-category.entity';

@Injectable()
export class WorkoutCategoryUseCase {
  constructor(
    @Inject(WORKOUT_CATEGORY_REPO)
    private readonly workoutCategoryRepository: IWorkoutCategoryRepository,
    private readonly userUseCases: UserUseCases,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getOne(workoutCategoryId: string, userId: string, organizationId: string) {
    try {
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

      // 4. Map the workout category
      const dto = WorkoutCategoryMapper.toDto(workoutCategory);

      // 5. Present the workout category
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll(userId: string, organizationId: string) {
    try {
      // 1. Verify user is a coach of the organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not a coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get the workout categories
      const workoutCategories = await this.workoutCategoryRepository.getAll(coachFilterConditions);

      // 4. Map the workout categories
      const dtos = WorkoutCategoryMapper.toDtoList(workoutCategories);

      // 5. Present the workout categories
      return WorkoutCategoryPresenter.present(dtos);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateWorkoutCategory, organizationId: string, userId: string) {
    try {
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

      // 8. Map the workout category
      const dto = WorkoutCategoryMapper.toDto(created);

      // 9. Present the workout category
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(workoutCategoryId: string, data: UpdateWorkoutCategory, organizationId: string, userId: string) {
    try {
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

      // 7. Map the workout category
      const dto = WorkoutCategoryMapper.toDto(updated);

      // 8. Present the workout category
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(workoutCategoryId: string, organizationId: string, userId: string) {
    try {
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

      // 5. Present the success message
      return WorkoutCategoryPresenter.presentSuccess('Workout category deleted successfully');
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }
}
