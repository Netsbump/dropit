import {
  CreateExercise,
  ExerciseResponse,
  UpdateExercise,
} from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseType } from '../../entities/exerciseType.entity';
@Injectable()
export class ExerciseService {
  constructor(private readonly em: EntityManager) {}

  async getExercises(): Promise<ExerciseResponse[]> {
    const exercises = await this.em.findAll(Exercise, {
      populate: ['exerciseType'],
    });

    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        exerciseType: {
          id: exercise.exerciseType.id,
          name: exercise.exerciseType.name,
        },
        video: exercise.video?.id,
        description: exercise.description,
        englishName: exercise.englishName,
        shortName: exercise.shortName,
      };
    });
  }

  async getExercise(id: number): Promise<ExerciseResponse> {
    const exercise = await this.em.findOne(
      Exercise,
      { id },
      {
        populate: ['exerciseType'],
      }
    );

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return {
      id: exercise.id,
      name: exercise.name,
      exerciseType: {
        id: exercise.exerciseType.id,
        name: exercise.exerciseType.name,
      },
      video: exercise.video?.id,
      description: exercise.description,
      englishName: exercise.englishName,
      shortName: exercise.shortName,
    };
  }

  async createExercise(newExercise: CreateExercise): Promise<ExerciseResponse> {
    if (!newExercise.name) {
      throw new BadRequestException('Exercise name is required');
    }

    const exerciseType = await this.em.findOne(ExerciseType, {
      id: newExercise.exerciseType,
    });

    if (!exerciseType) {
      throw new NotFoundException(
        `Exercise type with ID ${newExercise.exerciseType} not found`
      );
    }

    const exerciseToCreate = new Exercise();
    exerciseToCreate.name = newExercise.name;
    if (newExercise.description) {
      exerciseToCreate.description = newExercise.description;
    }
    exerciseToCreate.exerciseType = exerciseType;

    await this.em.persistAndFlush(exerciseToCreate);

    const exerciseCreated = await this.em.findOne(
      Exercise,
      {
        id: exerciseToCreate.id,
      },
      {
        populate: ['exerciseType'],
      }
    );

    if (!exerciseCreated) {
      throw new NotFoundException('Exercise not found');
    }

    return {
      id: exerciseCreated.id,
      name: exerciseCreated.name,
      exerciseType: {
        id: exerciseCreated.exerciseType.id,
        name: exerciseCreated.exerciseType.name,
      },
      video: exerciseCreated.video?.id,
      description: exerciseCreated.description,
      englishName: exerciseCreated.englishName,
      shortName: exerciseCreated.shortName,
    };
  }

  async updateExercise(
    id: number,
    exercise: UpdateExercise
  ): Promise<ExerciseResponse> {
    const exerciseToUpdate = await this.em.findOne(Exercise, { id });

    if (!exerciseToUpdate) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    wrap(exerciseToUpdate).assign(exercise);
    await this.em.persistAndFlush(exerciseToUpdate);

    const exerciseUpdated = await this.em.findOne(
      Exercise,
      {
        id: exerciseToUpdate.id,
      },
      {
        populate: ['exerciseType'],
      }
    );

    if (!exerciseUpdated) {
      throw new NotFoundException('Exercise not found');
    }

    return {
      id: exerciseUpdated.id,
      name: exerciseUpdated.name,
      exerciseType: {
        id: exerciseUpdated.exerciseType.id,
        name: exerciseUpdated.exerciseType.name,
      },
      video: exerciseUpdated.video?.id,
      description: exerciseUpdated.description,
      englishName: exerciseUpdated.englishName,
      shortName: exerciseUpdated.shortName,
    };
  }

  async deleteExercise(id: number): Promise<{ message: string }> {
    const exerciseToDelete = await this.em.findOne(Exercise, { id });

    if (!exerciseToDelete) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    await this.em.removeAndFlush(exerciseToDelete);

    return {
      message: 'Exercise deleted successfully',
    };
  }

  async searchExercises(query: string): Promise<ExerciseResponse[]> {
    const exercises = await this.em.find(
      Exercise,
      {
        name: { $ilike: `%${query}%` },
      },
      {
        populate: ['exerciseType'],
      }
    );

    if (!exercises) {
      throw new NotFoundException('Exercises not found');
    }

    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        exerciseType: {
          id: exercise.exerciseType.id,
          name: exercise.exerciseType.name,
        },
        video: exercise.video?.id,
        description: exercise.description,
        englishName: exercise.englishName,
        shortName: exercise.shortName,
      };
    });
  }
}
