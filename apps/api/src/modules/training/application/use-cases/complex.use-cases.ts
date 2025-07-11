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

  async getOne(complexId: string, organizationId: string) {
    try {
      const complex = await this.complexRepository.getOne(complexId, organizationId);
      if (!complex) {
        throw new NotFoundException('Complex not found');
      }
      const dto = ComplexMapper.toDto(complex);
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async getAll(organizationId: string) {
    try {
      const complexes = await this.complexRepository.getAll(organizationId);
      if (!complexes || complexes.length === 0) {
        throw new NotFoundException('No complexes found');
      }
      const dtos = ComplexMapper.toDtoList(complexes);
      return ComplexPresenter.present(dtos);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async create(data: CreateComplex, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }
      if (!data.name) {
        throw new BadRequestException('Complex name is required');
      }
      if (!data.exercises) {
        throw new BadRequestException('Exercises are required');
      }

      const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory);
      if (!complexCategory) {
        throw new NotFoundException(
          `Complex category with ID ${data.complexCategory} not found`
        );
      }

      const complex = new Complex();
      complex.name = data.name;
      complex.complexCategory = complexCategory;
      complex.description = data.description || '';

      const user = await this.organizationService.getUserById(userId);
      complex.createdBy = user;

      for (const exerciseData of data.exercises) {
        const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, organizationId);
        if (!exercise) {
          throw new NotFoundException(
            `Exercise with ID ${exerciseData.exerciseId} not found`
          );
        }

        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.order = exerciseData.order;
        exerciseComplex.reps = exerciseData.reps;
        exerciseComplex.exercise = exercise;
        exerciseComplex.complex = complex;

        complex.exercises.add(exerciseComplex);
      }

      await this.complexRepository.save(complex);
      const created = await this.complexRepository.getOne(complex.id, organizationId);
      if (!created) {
        throw new NotFoundException('Complex not found');
      }
      const dto = ComplexMapper.toDto(created);
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentCreationError(error as Error);
    }
  }

  async update(complexId: string, data: UpdateComplex, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      const complexToUpdate = await this.complexRepository.getOne(complexId, organizationId);
      if (!complexToUpdate) {
        throw new NotFoundException('Complex not found');
      }

      if (data.name) {
        complexToUpdate.name = data.name;
      }

      if (data.description !== undefined) {
        complexToUpdate.description = data.description;
      }

      if (data.complexCategory) {
        const complexCategory = await this.complexCategoryRepository.getOne(data.complexCategory);
        if (!complexCategory) {
          throw new NotFoundException(
            `Complex category with ID ${data.complexCategory} not found`
          );
        }
        complexToUpdate.complexCategory = complexCategory;
      }

      if (data.exercises) {
        const existingExercises = complexToUpdate.exercises.getItems();
        for (const exerciseComplex of existingExercises) {
          this.em.remove(exerciseComplex);
        }
        await this.em.flush();
        complexToUpdate.exercises.removeAll();

        for (const exerciseData of data.exercises) {
          const exercise = await this.exerciseRepository.getOne(exerciseData.exerciseId, organizationId);
          if (!exercise) {
            throw new NotFoundException(
              `Exercise with ID ${exerciseData.exerciseId} not found`
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

      await this.complexRepository.save(complexToUpdate);
      const updated = await this.complexRepository.getOne(complexId, organizationId);
      if (!updated) {
        throw new NotFoundException('Updated complex not found');
      }
      const dto = ComplexMapper.toDto(updated);
      return ComplexPresenter.presentOne(dto);
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }

  async delete(complexId: string, organizationId: string, userId: string) {
    try {
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);
      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      const complexToDelete = await this.complexRepository.getOne(complexId, organizationId);
      if (!complexToDelete) {
        throw new NotFoundException('Complex not found');
      }

      const exercises = complexToDelete.exercises.getItems();
      for (const exerciseComplex of exercises) {
        this.em.remove(exerciseComplex);
      }

      await this.complexRepository.remove(complexToDelete);
      return ComplexPresenter.presentSuccess('Complex deleted successfully');
    } catch (error) {
      return ComplexPresenter.presentError(error as Error);
    }
  }
}


