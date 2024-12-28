import { EntityManager, wrap } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseType } from '../../entities/exerciseType.entity';
import { ExerciseDto } from './exercice.dto';

@Injectable()
export class ExerciseService {
  constructor(private readonly em: EntityManager) {}

  async getExercises() {
    return this.em.find(Exercise, {});
  }

  async getExercise(id: number) {
    const exercise = await this.em.findOne(Exercise, { id });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async createExercise(exercise: ExerciseDto) {
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
    return exerciseToCreate;
  }

  async updateExercise(id: number, exercise: ExerciseDto) {
    const exerciseToUpdate = await this.em.findOne(Exercise, { id });
    if (!exerciseToUpdate) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    wrap(exerciseToUpdate).assign(exercise);
    await this.em.persistAndFlush(exerciseToUpdate);
    return exerciseToUpdate;
  }

  async deleteExercise(id: number) {
    const exerciseToDelete = await this.em.findOne(Exercise, { id });
    if (!exerciseToDelete) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    await this.em.removeAndFlush(exerciseToDelete);
  }

  async searchExercises(query: string) {
    return this.em.find(Exercise, {
      name: { $ilike: `%${query}%` },
    });
  }
}
