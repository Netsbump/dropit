import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExerciseRepository, EXERCISE_REPO } from '../ports/exercise.repository';
import { IExerciseCategoryRepository, EXERCISE_CATEGORY_REPO } from '../ports/exercise-category.repository';
import { CreateExercise, UpdateExercise } from '@dropit/schemas';
import { Exercise } from '../../domain/exercise.entity';
import { MEMBER_USE_CASES, IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { USER_USE_CASES, IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';

@Injectable()
export class ExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPO)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(EXERCISE_CATEGORY_REPO)
    private readonly exerciseCategoryRepository: IExerciseCategoryRepository,
    @Inject(USER_USE_CASES)
    private readonly userUseCases: IUserUseCases,
    @Inject(MEMBER_USE_CASES)
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(exerciseId: string, organizationId: string, userId: string): Promise<Exercise> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get exercise (filtering is managed in the repository)
    const exercise = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

    // 4. Validate exercise
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async getAll(organizationId: string, userId: string): Promise<Exercise[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get exercises from repository
    const exercises = await this.exerciseRepository.getAll(coachFilterConditions);

    // 4. Validate exercises
    if (!exercises || exercises.length === 0) {
      throw new NotFoundException('No exercises found');
    }

    return exercises;
  }

  async search(query: string, organizationId: string, userId: string): Promise<Exercise[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ForbiddenException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Search exercises from repository
    const exercises = await this.exerciseRepository.search(query, coachFilterConditions);

    // 4. Validate exercises
    if (!exercises) {
      throw new NotFoundException('Exercises not found');
    }

    return exercises;
  }

  async create(data: CreateExercise, organizationId: string, userId: string): Promise<Exercise> {
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

    //5. Create exercise
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

    //6. Get created exercise from repository
    const createdExercise = await this.exerciseRepository.getOne(exercise.id, coachFilterConditions);

    if (!createdExercise) {
      throw new NotFoundException('Exercise not found');
    }

    return createdExercise;
  }

  async update(exerciseId: string, data: UpdateExercise, organizationId: string, userId: string): Promise<Exercise> {
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

    //4. Update exercise
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

    //5. Update exercise in repository
    await this.exerciseRepository.save(exerciseToUpdate);

    //6. Get updated exercise from repository
    const updatedExercise = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

    if (!updatedExercise) {
      throw new NotFoundException('Updated exercise not found');
    }

    return updatedExercise;
  }

  async delete(exerciseId: string, organizationId: string, userId: string): Promise<void> {
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

    //4. Delete exercise
    await this.exerciseRepository.remove(exerciseToDelete);
  }
}
