import { EntityManager, wrap } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseType } from '../../entities/exerciseType.entity';
import {
  CreateExerciseDto,
  ExerciseDto,
  UpdateExerciseDto,
} from './exercice.dto';

@Injectable()
export class ExerciseService {
  constructor(private readonly em: EntityManager) {}

  async getExercises(): Promise<ExerciseDto[]> {
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

  async getExercise(id: number): Promise<ExerciseDto> {
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

  async createExercise(exercise: CreateExerciseDto): Promise<ExerciseDto> {
    if (!exercise.name) {
      throw new BadRequestException('Exercise name is required');
    }

    const exerciseType = await this.em.findOne(ExerciseType, {
      id: exercise.exerciseType,
    });

    if (!exerciseType) {
      throw new NotFoundException(
        `Exercise type with ID ${exercise.exerciseType} not found`
      );
    }

    const exerciseToCreate = new Exercise();
    exerciseToCreate.name = exercise.name;
    if (exercise.description) {
      exerciseToCreate.description = exercise.description;
    }
    exerciseToCreate.exerciseType = exerciseType;
    exerciseToCreate.createdAt = new Date();
    exerciseToCreate.updatedAt = new Date();

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
    exercise: UpdateExerciseDto
  ): Promise<ExerciseDto> {
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

  async searchExercises(query: string): Promise<ExerciseDto[]> {
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
