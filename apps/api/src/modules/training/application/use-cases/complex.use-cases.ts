import { IComplexRepository } from '../ports/complex.repository.port';
import { IComplexCategoryRepository } from '../ports/complex-category.repository.port';
import { IExerciseRepository } from '../ports/exercise.repository.port';
import { IExerciseComplexRepository } from '../ports/exercise-complex.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { CreateComplex, UpdateComplex } from '@dropit/schemas';
import { Complex } from '../../domain/complex.entity';
import { ExerciseComplex } from '../../domain/exercise-complex.entity';
import { IComplexUseCases } from '../ports/complex-use-cases.port';
import {
  ComplexNotFoundException,
  ComplexAccessDeniedException,
  ComplexCategoryNotFoundException,
  ExerciseNotFoundException,
  ComplexValidationException,
  NoComplexesFoundException,
} from '../exceptions/complex.exceptions';

/**
 * Complex Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of complex business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class ComplexUseCase implements IComplexUseCases {
  constructor(
    private readonly complexRepository: IComplexRepository,
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    private readonly exerciseRepository: IExerciseRepository,
    private readonly exerciseComplexRepository: IExerciseComplexRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly memberUseCases: IMemberUseCases,
  ) {}

  async getOne(complexId: string, organizationId: string, userId: string): Promise<Complex> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ComplexAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the complex (the filtering is managed in the repository)
    const complex = await this.complexRepository.getOne(complexId, coachFilterConditions);

    if (!complex) {
      throw new ComplexNotFoundException('Complex not found or access denied');
    }

    return complex;
  }

  async getAll(organizationId: string, userId: string): Promise<Complex[]> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ComplexAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the complexes (the filtering is managed in the repository)
    const complexes = await this.complexRepository.getAll(coachFilterConditions);

    if (!complexes || complexes.length === 0) {
      throw new NoComplexesFoundException('No complexes found');
    }

    return complexes;
  }

  async create(data: CreateComplex, organizationId: string, userId: string): Promise<Complex> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new ComplexAccessDeniedException('User is not coach of this organization');
    }

    // 2. Validate the data
    if (!data.exercises) {
      throw new ComplexValidationException('Exercises are required');
    }

    // 3. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 4. Get the complex category
    const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory, coachFilterConditions);
    if (!complexCategory) {
      throw new ComplexCategoryNotFoundException(
        `Complex category with ID ${data.complexCategory} not found`
      );
    }

    // 5. Create the complex
    const complex = new Complex();
    complex.complexCategory = complexCategory;
    complex.description = data.description || '';

    // 6. Assign the creator user
    const user = await this.userUseCases.getOne(userId);
    complex.createdBy = user;

    // 7. Add the exercises to the complex
    for (const exerciseData of data.exercises) {
      const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, coachFilterConditions);
      if (!exercise) {
        throw new ExerciseNotFoundException(
          `Exercise with ID ${exerciseData.exerciseId} not found or access denied`
        );
      }

      const exerciseComplex = new ExerciseComplex();
      exerciseComplex.order = exerciseData.order;
      exerciseComplex.reps = exerciseData.reps;
      exerciseComplex.exercise = exercise;
      exerciseComplex.complex = complex;

      complex.exercises.add(exerciseComplex);
    }

    // 8. Save the complex
    await this.complexRepository.save(complex);

    // 9. Get the created complex
    const complexCreated = await this.complexRepository.getOne(complex.id, coachFilterConditions);
    if (!complexCreated) {
      throw new ComplexNotFoundException('Complex not found');
    }

    return complexCreated;
  }

  async update(complexId: string, data: UpdateComplex, organizationId: string, userId: string): Promise<Complex> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ComplexAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the complex to update
    const complexToUpdate = await this.complexRepository.getOne(complexId, coachFilterConditions);
    if (!complexToUpdate) {
      throw new ComplexNotFoundException('Complex not found or access denied');
    }

    // 4. Update the complex properties
    if (data.description !== undefined) {
      complexToUpdate.description = data.description;
    }

    if (data.complexCategory) {
      const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory, coachFilterConditions);
      if (!complexCategory) {
        throw new ComplexCategoryNotFoundException(
          `Complex category with ID ${data.complexCategory} not found`
        );
      }
      complexToUpdate.complexCategory = complexCategory;
    }

    // 5. Update the exercises if provided
    if (data.exercises) {
      // Delete the old exercises
      const existingExercises = complexToUpdate.exercises.getItems();
      await this.exerciseComplexRepository.removeMany(existingExercises);
      complexToUpdate.exercises.removeAll();

      // Add the new exercises
      for (const exerciseData of data.exercises) {
        const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, coachFilterConditions);
        if (!exercise) {
          throw new ExerciseNotFoundException(
            `Exercise with ID ${exerciseData.exerciseId} not found or access denied`
          );
        }

        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.exercise = exercise;
        exerciseComplex.complex = complexToUpdate;
        exerciseComplex.order = exerciseData.order;
        exerciseComplex.reps = exerciseData.reps;

        complexToUpdate.exercises.add(exerciseComplex);
      }
    }

    // 6. Save the modifications
    await this.complexRepository.save(complexToUpdate);

    // 7. Get the updated complex
    const updated = await this.complexRepository.getOne(complexId, coachFilterConditions);
    if (!updated) {
      throw new ComplexNotFoundException('Updated complex not found');
    }

    return updated;
  }

  async delete(complexId: string, organizationId: string, userId: string): Promise<void> {
    // 1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);
    if (!isCoach) {
      throw new ComplexAccessDeniedException('User is not coach of this organization');
    }

    // 2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    // 3. Get the complex to delete
    const complexToDelete = await this.complexRepository.getOne(complexId, coachFilterConditions);
    if (!complexToDelete) {
      throw new ComplexNotFoundException('Complex not found or access denied');
    }

    // 4. Delete the exercises of the complex
    const exercises = complexToDelete.exercises.getItems();
    await this.exerciseComplexRepository.removeMany(exercises);

    // 5. Delete the complex
    await this.complexRepository.remove(complexToDelete);
  }
}


