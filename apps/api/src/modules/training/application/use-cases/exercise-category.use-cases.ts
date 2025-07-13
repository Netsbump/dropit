import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseCategoryPresenter } from '../../interface/presenters/exercise-category.presenter';
import { IExerciseCategoryRepository, EXERCISE_CATEGORY_REPO } from '../ports/exercise-category.repository';
import { MemberUseCases } from '../../../identity/application/member.use-cases';
import { UserUseCases } from '../../../identity/application/user.use-cases';
import { ExerciseCategoryMapper } from '../../interface/mappers/exercise-category.mapper';
import { CreateExerciseCategory, UpdateExerciseCategory } from '@dropit/schemas';
import { ExerciseCategory } from '../../domain/exercise-category.entity';

@Injectable()
export class ExerciseCategoryUseCase {
  constructor(
    @Inject(EXERCISE_CATEGORY_REPO)
    private readonly exerciseCategoryRepository: IExerciseCategoryRepository,
    private readonly userUseCases: UserUseCases,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getOne(exerciseCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get exercise category from repository
      const exerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategoryId, coachFilterConditions);

      // 4. Validate exercise category
      if (!exerciseCategory) {
        throw new NotFoundException('Exercise category not found or access denied');
      }

      // 5. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(exerciseCategory);

      // 6. Present exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
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

      // 3. Get exercise categories from repository
      const exerciseCategories = await this.exerciseCategoryRepository.getAll(coachFilterConditions);

      // 4. Map exercise categories to DTO
      const exerciseCategoriesDto = ExerciseCategoryMapper.toDtoList(exerciseCategories);

      // 5. Present exercise categories
      return ExerciseCategoryPresenter.present(exerciseCategoriesDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateExerciseCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Validate data
      if (!data.name) {
        throw new BadRequestException('Exercise category name is required');
      }

      // 3. Create exercise category
      const exerciseCategory = new ExerciseCategory();
      exerciseCategory.name = data.name;

      // 4. Assign the creator user
      const user = await this.userUseCases.getOne(userId);
      exerciseCategory.createdBy = user;

      await this.exerciseCategoryRepository.save(exerciseCategory);

      // 5. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 6. Get created exercise category from repository
      const createdExerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategory.id, coachFilterConditions);

      if (!createdExerciseCategory) {
        throw new NotFoundException('Exercise category not found');
      }

      // 7. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(createdExerciseCategory);

      // 8. Return exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentCreationError(error as Error);
    }
  }

  async update(exerciseCategoryId: string, data: UpdateExerciseCategory, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get exercise category to update from repository
      const exerciseCategoryToUpdate = await this.exerciseCategoryRepository.getOne(exerciseCategoryId, coachFilterConditions);

      if (!exerciseCategoryToUpdate) {
        throw new NotFoundException('Exercise category not found or access denied');
      }

      // 4. Update exercise category
      if (data.name) {
        exerciseCategoryToUpdate.name = data.name;
      }

      // 5. Update exercise category in repository
      await this.exerciseCategoryRepository.save(exerciseCategoryToUpdate);

      // 6. Get updated exercise category from repository
      const updatedExerciseCategory = await this.exerciseCategoryRepository.getOne(exerciseCategoryId, coachFilterConditions);

      if (!updatedExerciseCategory) {
        throw new NotFoundException('Updated exercise category not found');
      }

      // 7. Map exercise category to DTO
      const exerciseCategoryDto = ExerciseCategoryMapper.toDto(updatedExerciseCategory);

      // 8. Return exercise category
      return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }

  async delete(exerciseCategoryId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get exercise category to delete from repository
      const exerciseCategoryToDelete = await this.exerciseCategoryRepository.getOne(exerciseCategoryId, coachFilterConditions);

      if (!exerciseCategoryToDelete) {
        throw new NotFoundException('Exercise category not found or access denied');
      }

      // 4. Delete exercise category
      await this.exerciseCategoryRepository.remove(exerciseCategoryToDelete);

      // 5. Return success message
      return ExerciseCategoryPresenter.presentSuccess('Exercise category deleted successfully');
    } catch (error) {
      return ExerciseCategoryPresenter.presentError(error as Error);
    }
  }
}