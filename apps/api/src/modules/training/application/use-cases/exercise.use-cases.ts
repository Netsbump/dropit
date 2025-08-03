import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExercisePresenter } from '../../interface/presenters/exercise.presenter';
import { IExerciseRepository, EXERCISE_REPO } from '../ports/exercise.repository';
import { IExerciseCategoryRepository, EXERCISE_CATEGORY_REPO } from '../ports/exercise-category.repository';
import { ExerciseMapper } from '../../interface/mappers/exercise.mapper';
import { CreateExercise, UpdateExercise } from '@dropit/schemas';
import { Exercise } from '../../domain/exercise.entity';
import { MemberUseCases } from '../../../identity/application/member.use-cases';
import { UserUseCases } from '../../../identity/application/user.use-cases';

@Injectable()
export class ExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPO)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(EXERCISE_CATEGORY_REPO)
    private readonly exerciseCategoryRepository: IExerciseCategoryRepository,
    private readonly userUseCases: UserUseCases,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async getOne(exerciseId: string, organizationId: string, userId: string) {
    try {

      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization'); 
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Get exercise (filtering is managed in the repository)
      const exercise = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

      //3. Validate exercise
      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }

      //3. Map exercise to DTO
      const exerciseDto = ExerciseMapper.toDto(exercise);

      //4. Present exercise
      return ExercisePresenter.presentOne(exerciseDto);
    } catch (error) {
      return ExercisePresenter.presentError(error as Error);
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

      // 3. Get exercises from repository
      const exercises = await this.exerciseRepository.getAll(coachFilterConditions);

      // 3. Validate exercises
      if (!exercises || exercises.length === 0) {
        throw new NotFoundException('No exercises found');
      }

      // 4. Map exercises to DTO
      const exercisesDto = ExerciseMapper.toDtoList(exercises);

      // 5. Present exercises
      return ExercisePresenter.presentList(exercisesDto);
    } catch (error) {
      return ExercisePresenter.presentError(error as Error);
    }
  }

  async search(query: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      // 3. Search exercises from repository
      const exercises = await this.exerciseRepository.search(query, coachFilterConditions);

      // 3. Validate exercises
      if (!exercises) {
        throw new NotFoundException('Exercises not found');
      }

      // 4. Map exercises to DTO
      const exercisesDto = ExerciseMapper.toDtoList(exercises);

      // 5. Present exercises
      return ExercisePresenter.presentList(exercisesDto);
    } catch (error) {
      return ExercisePresenter.presentError(error as Error);
    }
  }

  async create(data: CreateExercise, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      //2. Validate data
      if (!data.name) {
        throw new BadRequestException('Exercise name is required');
      }

      //3. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      //4. Get exercise category via repository
      const exerciseCategory = await this.exerciseCategoryRepository.getOne(data.exerciseCategory, coachFilterConditions);

      if (!exerciseCategory) {
        throw new NotFoundException(
          `Exercise category with ID ${data.exerciseCategory} not found`
        );
      }

      //4. Create exercise
      const exercise = new Exercise();
      exercise.name = data.name;
      if (data.description) {
        exercise.description = data.description;
      }
      exercise.exerciseCategory = exerciseCategory;
      if (data.englishName) {
        exercise.englishName = data.englishName;
      }
      if (data.shortName) {
        exercise.shortName = data.shortName;
      }
      
      // Assign the creator user
      const user = await this.userUseCases.getOne(userId);
      exercise.createdBy = user;
      
      // TODO: add video

      await this.exerciseRepository.save(exercise);

      //5. Get created exercise from repository
      const createdExercise = await this.exerciseRepository.getOne(exercise.id, coachFilterConditions);

      if (!createdExercise) {
        throw new NotFoundException('Exercise not found');
      }

      //6. Map exercise to DTO
      const exerciseDto = ExerciseMapper.toDto(createdExercise);

      //7. Return exercise
      return ExercisePresenter.presentCreationSuccess(exerciseDto);
    } catch (error) {
      return ExercisePresenter.presentCreationError(error as Error);
    }
  }

  async update(exerciseId: string, data: UpdateExercise, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      //2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      //3. Get exercise to update from repository
      const exerciseToUpdate = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

      if (!exerciseToUpdate) {
        throw new NotFoundException('Exercise not found');
      }

      //3. Update exercise
      if (data.name) {
        exerciseToUpdate.name = data.name;
      }
      if (data.description !== undefined) {
        exerciseToUpdate.description = data.description;
      }
      if (data.englishName !== undefined) {
        exerciseToUpdate.englishName = data.englishName;
      }
      if (data.shortName !== undefined) {
        exerciseToUpdate.shortName = data.shortName;
      }

      //4. Update exercise in repository
      await this.exerciseRepository.save(exerciseToUpdate);

      //6. Get updated exercise from repository
      const updatedExercise = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

      if (!updatedExercise) {
        throw new NotFoundException('Updated exercise not found');
      }

      //6. Map exercise to DTO
      const exerciseDto = ExerciseMapper.toDto(updatedExercise);

      //7. Return exercise
      return ExercisePresenter.presentOne(exerciseDto);
    } catch (error) {
      return ExercisePresenter.presentError(error as Error);
    }
  }

  async delete(exerciseId: string, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
      const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      //2. Get filter conditions via use case
      const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

      //3. Get exercise to delete from repository
      const exerciseToDelete = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

      if (!exerciseToDelete) {
        throw new NotFoundException('Exercise not found');
      }

      //3. Delete exercise
      await this.exerciseRepository.remove(exerciseToDelete);

      //4. Return success message
      return ExercisePresenter.presentSuccess('Exercise deleted successfully');
    } catch (error) {
      return ExercisePresenter.presentError(error as Error);
    }
  }
}
