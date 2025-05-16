import {
  CreateExerciseCategory,
  ExerciseCategoryDto,
  UpdateExerciseCategory,
} from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExerciseCategory } from '../../entities/exercise-category.entity';

@Injectable()
export class ExerciseCategoryService {
  constructor(private readonly em: EntityManager) {}

  async getExerciseCategories(): Promise<ExerciseCategoryDto[]> {
    const exerciseCategories = await this.em.find(ExerciseCategory, {});

    return exerciseCategories.map((exerciseCategory) => ({
      id: exerciseCategory.id,
      name: exerciseCategory.name,
    }));
  }

  async getExerciseCategory(id: string): Promise<ExerciseCategoryDto> {
    const exerciseCategory = await this.em.findOne(ExerciseCategory, { id });

    if (!exerciseCategory) {
      throw new NotFoundException(`Exercise category with ID ${id} not found`);
    }

    return {
      id: exerciseCategory.id,
      name: exerciseCategory.name,
    };
  }

  async createExerciseCategory(
    newExerciseCategory: CreateExerciseCategory
  ): Promise<ExerciseCategoryDto> {
    if (!newExerciseCategory.name) {
      throw new BadRequestException('Exercise category name is required');
    }

    const exerciseCategoryToCreate = new ExerciseCategory();
    exerciseCategoryToCreate.name = newExerciseCategory.name;
    await this.em.persistAndFlush(exerciseCategoryToCreate);

    const exerciseCategoryCreated = await this.em.findOne(ExerciseCategory, {
      id: exerciseCategoryToCreate.id,
    });

    if (!exerciseCategoryCreated) {
      throw new NotFoundException(
        `Exercise category with ID ${exerciseCategoryToCreate.id} not found`
      );
    }

    return {
      id: exerciseCategoryCreated.id,
      name: exerciseCategoryCreated.name,
    };
  }

  async updateExerciseCategory(
    id: string,
    exerciseCategory: UpdateExerciseCategory
  ): Promise<ExerciseCategoryDto> {
    const exerciseCategoryToUpdate = await this.em.findOne(ExerciseCategory, {
      id,
    });

    if (!exerciseCategoryToUpdate) {
      throw new Error('Exercise category not found');
    }

    wrap(exerciseCategoryToUpdate).assign(exerciseCategory, {
      mergeObjectProperties: true,
    });

    await this.em.persistAndFlush(exerciseCategoryToUpdate);

    const exerciseCategoryUpdated = await this.em.findOne(ExerciseCategory, {
      id: exerciseCategoryToUpdate.id,
    });

    if (!exerciseCategoryUpdated) {
      throw new NotFoundException(
        `Exercise category with ID ${exerciseCategoryToUpdate.id} not found`
      );
    }

    return {
      id: exerciseCategoryUpdated.id,
      name: exerciseCategoryUpdated.name,
    };
  }

  async deleteExerciseCategory(id: string): Promise<{ message: string }> {
    const exerciseCategoryToDelete = await this.em.findOne(ExerciseCategory, {
      id,
    });

    if (!exerciseCategoryToDelete) {
      throw new NotFoundException(`Exercise category with ID ${id} not found`);
    }

    await this.em.removeAndFlush(exerciseCategoryToDelete);

    return {
      message: 'Exercise category deleted successfully',
    };
  }
}
