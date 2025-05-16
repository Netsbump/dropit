import {
  CreateWorkoutCategory,
  UpdateWorkoutCategory,
  WorkoutCategoryDto,
} from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkoutCategory } from '../../entities/workout-category.entity';

@Injectable()
export class WorkoutCategoryService {
  constructor(private readonly em: EntityManager) {}

  async getWorkoutCategories(): Promise<WorkoutCategoryDto[]> {
    const workoutCategories = await this.em.find(WorkoutCategory, {});

    return workoutCategories.map((workoutCategory) => ({
      id: workoutCategory.id,
      name: workoutCategory.name,
    }));
  }

  async getWorkoutCategory(id: string): Promise<WorkoutCategoryDto> {
    const workoutCategory = await this.em.findOne(WorkoutCategory, { id });

    if (!workoutCategory) {
      throw new NotFoundException(`Workout category with ID ${id} not found`);
    }

    return {
      id: workoutCategory.id,
      name: workoutCategory.name,
    };
  }

  async createWorkoutCategory(
    newWorkoutCategory: CreateWorkoutCategory
  ): Promise<WorkoutCategoryDto> {
    if (!newWorkoutCategory.name) {
      throw new BadRequestException('Workout category name is required');
    }

    const workoutCategoryToCreate = new WorkoutCategory();
    workoutCategoryToCreate.name = newWorkoutCategory.name;
    await this.em.persistAndFlush(workoutCategoryToCreate);

    const workoutCategoryCreated = await this.em.findOne(WorkoutCategory, {
      id: workoutCategoryToCreate.id,
    });

    if (!workoutCategoryCreated) {
      throw new NotFoundException(
        `Workout category with ID ${workoutCategoryToCreate.id} not found`
      );
    }

    return {
      id: workoutCategoryCreated.id,
      name: workoutCategoryCreated.name,
    };
  }

  async updateWorkoutCategory(
    id: string,
    updatedWorkoutCategory: UpdateWorkoutCategory
  ): Promise<WorkoutCategoryDto> {
    const workoutCategoryToUpdate = await this.em.findOne(WorkoutCategory, {
      id,
    });

    if (!workoutCategoryToUpdate) {
      throw new NotFoundException(`Workout category with ID ${id} not found`);
    }

    wrap(workoutCategoryToUpdate).assign(updatedWorkoutCategory, {
      mergeObjectProperties: true,
    });

    await this.em.persistAndFlush(workoutCategoryToUpdate);

    const workoutCategoryUpdated = await this.em.findOne(WorkoutCategory, {
      id: workoutCategoryToUpdate.id,
    });

    if (!workoutCategoryUpdated) {
      throw new NotFoundException(
        `Workout category with ID ${workoutCategoryToUpdate.id} not found`
      );
    }

    return {
      id: workoutCategoryUpdated.id,
      name: workoutCategoryUpdated.name,
    };
  }

  async deleteWorkoutCategory(id: string): Promise<{ message: string }> {
    const workoutCategoryToDelete = await this.em.findOne(WorkoutCategory, {
      id,
    });

    if (!workoutCategoryToDelete) {
      throw new NotFoundException(`Workout category with ID ${id} not found`);
    }

    await this.em.removeAndFlush(workoutCategoryToDelete);

    return {
      message: 'Workout category deleted successfully',
    };
  }
}
