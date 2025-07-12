import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ComplexPresenter } from '../../interface/presenters/complex.presenter';
import { IComplexRepository, COMPLEX_REPO } from '../ports/complex.repository';
import { IComplexCategoryRepository, COMPLEX_CATEGORY_REPO } from '../ports/complex-category.repository';
import { IExerciseRepository, EXERCISE_REPO } from '../ports/exercise.repository';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { ComplexMapper } from '../../interface/mappers/complex.mapper';
import { CreateComplex, UpdateComplex } from '@dropit/schemas';
import { Complex } from '../../domain/complex.entity';
import { ExerciseComplex } from '../../domain/exercise-complex.entity';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class ComplexUseCase {
  constructor(
    @Inject(COMPLEX_REPO)
    private readonly complexRepository: IComplexRepository,
    @Inject(COMPLEX_CATEGORY_REPO)
    private readonly complexCategoryRepository: IComplexCategoryRepository,
    @Inject(EXERCISE_REPO)
    private readonly exerciseRepository: IExerciseRepository,
    private readonly organizationService: OrganizationService,
    private readonly em: EntityManager
  ) {}

  async getOne(complexId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get the complex (the filtering is managed in the repository)
      const complex = await this.complexRepository.getOne(complexId, organizationId);
      
      if (!complex) {
        throw new NotFoundException('Complex not found or access denied');
      }

      // 3. Map and present the complex
      const dto = ComplexMapper.toDto(complex);

      // 4. Present the complex
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async getAll(organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get the complexes (the filtering is managed in the repository)
      const complexes = await this.complexRepository.getAll(organizationId);
      
      if (!complexes || complexes.length === 0) {
        throw new NotFoundException('No complexes found');
      }

      // 3. Map and present the complexes
      const dtos = ComplexMapper.toDtoList(complexes);

      // 4. Present the complexes
      return ComplexPresenter.present(dtos);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateComplex, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Validate the data
      if (!data.name) {
        throw new BadRequestException('Complex name is required');
      }
      if (!data.exercises) {
        throw new BadRequestException('Exercises are required');
      }

      // 3. Get the complex category
      const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory, organizationId);
      if (!complexCategory) {
        throw new NotFoundException(
          `Complex category with ID ${data.complexCategory} not found`
        );
      }

      // 4. Create the complex
      const complex = new Complex();
      complex.name = data.name;
      complex.complexCategory = complexCategory;
      complex.description = data.description || '';

      // 5. Assign the creator user
      const user = await this.organizationService.getUserById(userId);
      complex.createdBy = user;

      // 6. Add the exercises to the complex
      for (const exerciseData of data.exercises) {
        const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, organizationId);
        if (!exercise) {
          throw new NotFoundException(
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

      // 7. Save the complex
      await this.complexRepository.save(complex);

      // 8. Get the created complex
      const created = await this.complexRepository.getOne(complex.id, organizationId);
      if (!created) {
        throw new NotFoundException('Complex not found');
      }

      // 9. Map the complex
      const dto = ComplexMapper.toDto(created);

      // 10. Present the complex
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentCreationError(error as Error);
    }
  }

  async update(complexId: string, data: UpdateComplex, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get the complex to update
      const complexToUpdate = await this.complexRepository.getOne(complexId, organizationId);
      if (!complexToUpdate) {
        throw new NotFoundException('Complex not found or access denied');
      }

      // 3. Update the complex properties
      if (data.name) {
        complexToUpdate.name = data.name;
      }

      if (data.description !== undefined) {
        complexToUpdate.description = data.description;
      }

      if (data.complexCategory) {
        const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory, organizationId);
        if (!complexCategory) {
          throw new NotFoundException(
            `Complex category with ID ${data.complexCategory} not found`
          );
        }
        complexToUpdate.complexCategory = complexCategory;
      }

      // 4. Update the exercises if provided
      if (data.exercises) {
        // Delete the old exercises
        const existingExercises = complexToUpdate.exercises.getItems();
        for (const exerciseComplex of existingExercises) {
          this.em.remove(exerciseComplex);
        }
        await this.em.flush();
        complexToUpdate.exercises.removeAll();

        // Add the new exercises
        for (const exerciseData of data.exercises) {
          const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, organizationId);
          if (!exercise) {
            throw new NotFoundException(
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

      // 5. Save the modifications
      await this.complexRepository.save(complexToUpdate);

      // 6. Get the updated complex
      const updated = await this.complexRepository.getOne(complexId, organizationId);
      if (!updated) {
        throw new NotFoundException('Updated complex not found');
      }

      // 7. Map the complex
      const dto = ComplexMapper.toDto(updated);

      // 8. Present the complex
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async delete(complexId: string, organizationId: string, userId: string) {
    try {
      // 1. Check if the user is coach of this organization
      const isCoach = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isCoach) {
        throw new ForbiddenException('User is not coach of this organization');
      }

      // 2. Get the complex to delete
      const complexToDelete = await this.complexRepository.getOne(complexId, organizationId);
      if (!complexToDelete) {
        throw new NotFoundException('Complex not found or access denied');
      }

      // 3. Delete the exercises of the complex
      const exercises = complexToDelete.exercises.getItems();
      for (const exerciseComplex of exercises) {
        this.em.remove(exerciseComplex);
      }

      // 4. Delete the complex
      await this.complexRepository.remove(complexToDelete);

      // 5. Present the success message
      return ComplexPresenter.presentSuccess('Complex deleted successfully');
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }
}


