import { CreateExercise, ExerciseDto, UpdateExercise } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { wrap } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExerciseCategory } from '../exercise-category/exercise-category.entity';
import { Exercise } from './exercise.entity';
import { OrganizationService } from '../../identity/organization/organization.service';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService
  ) {}

  async getExercises(organizationId: string): Promise<ExerciseDto[]> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const exercises = await this.em.find(Exercise, {
      ...filterConditions,
    }, {
      populate: ['exerciseCategory'],
    });

    if (!exercises || exercises.length === 0) {
      throw new NotFoundException('No exercises found');
    }

    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        exerciseCategory: {
          id: exercise.exerciseCategory.id,
          name: exercise.exerciseCategory.name,
        },
        video: exercise.video?.id ?? undefined,
        description: exercise.description ?? '',
        englishName: exercise.englishName ?? '',
        shortName: exercise.shortName ?? '',
      };
    });
  }

  async getExercise(id: string, organizationId: string): Promise<ExerciseDto> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const exercise = await this.em.findOne(
      Exercise,
      {
        id,
        ...filterConditions,
      },
      {
        populate: ['exerciseCategory'],
      }
    );

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return {
      id: exercise.id,
      name: exercise.name,
      exerciseCategory: {
        id: exercise.exerciseCategory.id,
        name: exercise.exerciseCategory.name,
      },
      video: exercise.video?.id,
      description: exercise.description,
      englishName: exercise.englishName,
      shortName: exercise.shortName,
    };
  }

  async createExercise(newExercise: CreateExercise, userId: string): Promise<ExerciseDto> {
    if (!newExercise.name) {
      throw new BadRequestException('Exercise name is required');
    }

    const exerciseCategory = await this.em.findOne(ExerciseCategory, {
      id: newExercise.exerciseCategory,
    });

    if (!exerciseCategory) {
      throw new NotFoundException(
        `Exercise category with ID ${newExercise.exerciseCategory} not found`
      );
    }

    const exerciseToCreate = new Exercise();
    exerciseToCreate.name = newExercise.name;
    if (newExercise.description) {
      exerciseToCreate.description = newExercise.description;
    }
    exerciseToCreate.exerciseCategory = exerciseCategory;
    if (newExercise.englishName) {
      exerciseToCreate.englishName = newExercise.englishName;
    }
    if (newExercise.shortName) {
      exerciseToCreate.shortName = newExercise.shortName;
    }
    
    // Assigner le coach créateur
    const user = await this.organizationService.getUserById(userId);
    exerciseToCreate.createdBy = user;
    
    // TODO: add video

    await this.em.persistAndFlush(exerciseToCreate);

    const exerciseCreated = await this.em.findOne(
      Exercise,
      {
        id: exerciseToCreate.id,
      },
      {
        populate: ['exerciseCategory'],
      }
    );

    if (!exerciseCreated) {
      throw new NotFoundException('Exercise not found');
    }

    return {
      id: exerciseCreated.id,
      name: exerciseCreated.name,
      exerciseCategory: {
        id: exerciseCreated.exerciseCategory.id,
        name: exerciseCreated.exerciseCategory.name,
      },
      video: exerciseCreated.video?.id,
      description: exerciseCreated.description,
      englishName: exerciseCreated.englishName,
      shortName: exerciseCreated.shortName,
    };
  }

  async updateExercise(
    id: string,
    exercise: UpdateExercise,
    organizationId: string
  ): Promise<ExerciseDto> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const exerciseToUpdate = await this.em.findOne(
      Exercise,
      {
        id,
        ...filterConditions,
      },
      {
        populate: ['exerciseCategory'],
      }
    );

    if (!exerciseToUpdate) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    wrap(exerciseToUpdate).assign(exercise, { mergeObjectProperties: true });

    await this.em.persistAndFlush(exerciseToUpdate);

    const exerciseUpdated = await this.em.findOne(
      Exercise,
      {
        id: exerciseToUpdate.id,
      },
      {
        populate: ['exerciseCategory'],
      }
    );

    if (!exerciseUpdated) {
      throw new NotFoundException('Exercise not found');
    }

    return {
      id: exerciseUpdated.id,
      name: exerciseUpdated.name,
      exerciseCategory: {
        id: exerciseUpdated.exerciseCategory.id,
        name: exerciseUpdated.exerciseCategory.name,
      },
      video: exerciseUpdated.video?.id,
      description: exerciseUpdated.description,
      englishName: exerciseUpdated.englishName,
      shortName: exerciseUpdated.shortName,
    };
  }

  async deleteExercise(id: string, organizationId: string): Promise<{ message: string }> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const exerciseToDelete = await this.em.findOne(Exercise, {
      id,
      ...filterConditions,
    });

    if (!exerciseToDelete) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    await this.em.removeAndFlush(exerciseToDelete);

    return {
      message: 'Exercise deleted successfully',
    };
  }

  async searchExercises(query: string, organizationId: string): Promise<ExerciseDto[]> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const exercises = await this.em.find(
      Exercise,
      {
        name: { $ilike: `%${query}%` },
        ...filterConditions,
      },
      {
        populate: ['exerciseCategory'],
      }
    );

    if (!exercises) {
      throw new NotFoundException('Exercises not found');
    }

    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        exerciseCategory: {
          id: exercise.exerciseCategory.id,
          name: exercise.exerciseCategory.name,
        },
        video: exercise.video?.id,
        description: exercise.description,
        englishName: exercise.englishName,
        shortName: exercise.shortName,
      };
    });
  }
}
