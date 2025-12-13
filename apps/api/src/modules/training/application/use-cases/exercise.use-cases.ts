import { IExerciseRepository } from '../ports/exercise.repository.port';
import { IExerciseCategoryRepository } from '../ports/exercise-category.repository.port';
import { CreateExercise, UpdateExercise } from '@dropit/schemas';
import { Exercise } from '../../domain/exercise.entity';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { IExerciseUseCases } from '../ports/exercise-use-cases.port';
import {
  ExerciseNotFoundException,
  ExerciseAccessDeniedException,
  ExerciseCategoryNotFoundException,
  ExerciseValidationException,
  NoExercisesFoundException,
} from '../exceptions/exercise.exceptions';

/**
 * Exercise Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of exercise business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class ExerciseUseCase implements IExerciseUseCases {
  constructor(
    private readonly exerciseRepository: IExerciseRepository,
    private readonly exerciseCategoryRepository: IExerciseCategoryRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly memberUseCases: IMemberUseCases
  ) {}

  async getOne(exerciseId: string, organizationId: string, userId: string): Promise<Exercise> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get exercise (filtering is managed in the repository)
    const exercise = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

    // 4. Validate exercise
    if (!exercise) {
      throw new ExerciseNotFoundException('Exercise not found');
    }

    return exercise;
  }

  async getAll(organizationId: string, userId: string): Promise<Exercise[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get exercises from repository
    const exercises = await this.exerciseRepository.getAll(coachFilterConditions);

    // 4. Validate exercises
    if (!exercises || exercises.length === 0) {
      throw new NoExercisesFoundException('No exercises found');
    }

    return exercises;
  }

  async search(query: string, organizationId: string, userId: string): Promise<Exercise[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Search exercises from repository
    const exercises = await this.exerciseRepository.search(query, coachFilterConditions);

    // 4. Validate exercises
    if (!exercises) {
      throw new ExerciseNotFoundException('Exercises not found');
    }

    return exercises;
  }

  async create(data: CreateExercise, organizationId: string, userId: string): Promise<Exercise> {
    //1. Check if the user is admin of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    //2. Validate data
    if (!data.name) {
      throw new ExerciseValidationException('Exercise name is required');
    }

    //3. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //4. Get exercise category via repository
    const exerciseCategory = await this.exerciseCategoryRepository.getOne(data.exerciseCategory, coachFilterConditions);

    if (!exerciseCategory) {
      throw new ExerciseCategoryNotFoundException(
        `Exercise category with ID ${data.exerciseCategory} not found`
      );
    }

    //5. Create exercise
    const exercise = new Exercise();
    exercise.name = data.name;
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
      throw new ExerciseNotFoundException('Exercise not found');
    }

    return createdExercise;
  }

  async update(exerciseId: string, data: UpdateExercise, organizationId: string, userId: string): Promise<Exercise> {
    //1. Check if the user is admin of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get exercise to update from repository
    const exerciseToUpdate = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

    if (!exerciseToUpdate) {
      throw new ExerciseNotFoundException('Exercise not found');
    }

    //4. Update exercise
    if (data.name) {
      exerciseToUpdate.name = data.name;
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
      throw new ExerciseNotFoundException('Updated exercise not found');
    }

    return updatedExercise;
  }

  async delete(exerciseId: string, organizationId: string, userId: string): Promise<void> {
    //1. Check if the user is admin of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ExerciseAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get exercise to delete from repository
    const exerciseToDelete = await this.exerciseRepository.getOne(exerciseId, coachFilterConditions);

    if (!exerciseToDelete) {
      throw new ExerciseNotFoundException('Exercise not found');
    }

    //4. Delete exercise
    await this.exerciseRepository.remove(exerciseToDelete);
  }
}
