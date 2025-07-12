import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IExerciseComplexRepository } from '../application/ports/exercise-complex.repository';
import { ExerciseComplex } from '../domain/exercise-complex.entity';

@Injectable()
export class MikroExerciseComplexRepository implements IExerciseComplexRepository {
  constructor(private readonly em: EntityManager) {}

  async remove(exerciseComplex: ExerciseComplex): Promise<void> {
    this.em.remove(exerciseComplex);
    await this.em.flush();
  }

  async removeMany(exerciseComplexes: ExerciseComplex[]): Promise<void> {
    for (const exerciseComplex of exerciseComplexes) {
      this.em.remove(exerciseComplex);
    }
    await this.em.flush();
  }
} 