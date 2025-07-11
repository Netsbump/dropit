import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutCategoryPresenter } from '../../interface/presenters/workout-category.presenter';
import { IWorkoutCategoryRepository, WORKOUT_CATEGORY_REPO } from '../ports/workout-category.repository';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { WorkoutCategoryMapper } from '../../interface/mappers/workout-category.mapper';
import { CreateWorkoutCategory, UpdateWorkoutCategory } from '@dropit/schemas';
import { WorkoutCategory } from '../../domain/workout-category.entity';

@Injectable()
export class WorkoutCategoryUseCase {
  constructor(
    @Inject(WORKOUT_CATEGORY_REPO)
    private readonly workoutCategoryRepository: IWorkoutCategoryRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async getOne(workoutCategoryId: string) {
    try {
      const workoutCategory = await this.workoutCategoryRepository.getOne(workoutCategoryId);
      if (!workoutCategory) {
        throw new NotFoundException('Workout category not found');
      }
      const dto = WorkoutCategoryMapper.toDto(workoutCategory);
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll() {
    try {
      const workoutCategories = await this.workoutCategoryRepository.getAll();
      const dtos = WorkoutCategoryMapper.toDtoList(workoutCategories);
      return WorkoutCategoryPresenter.present(dtos);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateWorkoutCategory, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }
      if (!data.name) {
        throw new BadRequestException('Workout category name is required');
      }

      const workoutCategory = new WorkoutCategory();
      workoutCategory.name = data.name;
      await this.workoutCategoryRepository.save(workoutCategory);

      const created = await this.workoutCategoryRepository.getOne(workoutCategory.id);
      if (!created) {
        throw new NotFoundException('Workout category not found');
      }
      const dto = WorkoutCategoryMapper.toDto(created);
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(workoutCategoryId: string, data: UpdateWorkoutCategory, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      const toUpdate = await this.workoutCategoryRepository.getOne(workoutCategoryId);
      if (!toUpdate) {
        throw new NotFoundException('Workout category not found');
      }

      if (data.name) {
        toUpdate.name = data.name;
      }

      await this.workoutCategoryRepository.save(toUpdate);
      const updated = await this.workoutCategoryRepository.getOne(workoutCategoryId);
      if (!updated) {
        throw new NotFoundException('Updated workout category not found');
      }
      const dto = WorkoutCategoryMapper.toDto(updated);
      return WorkoutCategoryPresenter.presentOne(dto);
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(workoutCategoryId: string, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      const toDelete = await this.workoutCategoryRepository.getOne(workoutCategoryId);
      if (!toDelete) {
        throw new NotFoundException('Workout category not found');
      }

      await this.workoutCategoryRepository.remove(toDelete);
      return WorkoutCategoryPresenter.presentSuccess('Workout category deleted successfully');
    } catch (error) {
      return WorkoutCategoryPresenter.presentError(error as Error);
    }
  }
}
