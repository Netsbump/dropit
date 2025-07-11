import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseCategoryPresenter } from '../../interface/presenters/exercise-category.presenter';
import { IExerciseCategoryRepository, EXERCISE_CATEGORY_REPO } from '../ports/exercise-category.repository';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { ExerciseCategoryMapper } from '../../interface/mappers/exercise-category.mapper';
import { CreateExerciseCategory, UpdateExerciseCategory } from '@dropit/schemas';
import { ExerciseCategory } from '../../domain/exercise-category.entity';

@Injectable()
export class ExerciseCategoryUseCase {
  constructor(
    @Inject(EXERCISE_CATEGORY_REPO)
    private readonly exerciseCategoryRepository: IExerciseCategoryRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async getOne(exerciseCategoryId: string) {
    try {
      //1. Get exercise category from repository
      const exerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategoryId);

      //2. Validate exercise category
      if (!exerciseCategory) {
        throw new NotFoundException('Exercise category not found');
      }

      //3. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(exerciseCategory);

      //4. Present exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }

  async getAll() {
    try {
      //1. Get exercise categories from repository
      const exerciseCategories = await this.exerciseCategoryRepository.getAll();

      //2. Map exercise categories to DTO
      const exerciseCategoriesDto = ExerciseCategoryMapper.toDtoList(exerciseCategories);

      //3. Present exercise categories
      return ExerciseCategoryPresenter.present(exerciseCategoriesDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateExerciseCategory, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);

      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      //2. Validate data
      if (!data.name) {
        throw new BadRequestException('Exercise category name is required');
      }

      //3. Create exercise category
      const exerciseCategory = new ExerciseCategory();
      exerciseCategory.name = data.name;

      await this.exerciseCategoryRepository.save(exerciseCategory);

      //4. Get created exercise category from repository
      const createdExerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategory.id);

      if (!createdExerciseCategory) {
        throw new NotFoundException('Exercise category not found');
      }

      //5. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(createdExerciseCategory);

      //6. Return exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(exerciseCategoryId: string, data: UpdateExerciseCategory, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);

      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      //2. Get exercise category to update from repository
      const exerciseCategoryToUpdate = await this.exerciseCategoryRepository.getOne(exerciseCategoryId);

      if (!exerciseCategoryToUpdate) {
        throw new NotFoundException('Exercise category not found');
      }

      //3. Update exercise category
      if (data.name) {
        exerciseCategoryToUpdate.name = data.name;
      }

      //4. Update exercise category in repository
      await this.exerciseCategoryRepository.save(exerciseCategoryToUpdate);

      //5. Get updated exercise category from repository
      const updatedExerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategoryId);

      if (!updatedExerciseCategory) {
        throw new NotFoundException('Updated exercise category not found');
      }

      //6. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(updatedExerciseCategory);

      //7. Return exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(exerciseCategoryId: string, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);

      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      //2. Get exercise category to delete from repository
      const exerciseCategoryToDelete = await this.exerciseCategoryRepository.getOne(exerciseCategoryId);

      if (!exerciseCategoryToDelete) {
        throw new NotFoundException('Exercise category not found');
      }

      //3. Delete exercise category
      await this.exerciseCategoryRepository.remove(exerciseCategoryToDelete);

      //4. Return success message
      return ExerciseCategoryPresenter.presentSuccess('Exercise category deleted successfully');
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }
}