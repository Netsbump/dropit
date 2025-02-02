import { ComplexDto, CreateComplex, UpdateComplex } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplexCategory } from '../../entities/complex-category.entity';
import { Complex } from '../../entities/complex.entity';
import { ExerciseComplex } from '../../entities/exercise-complex.entity';
import { Exercise } from '../../entities/exercise.entity';

@Injectable()
export class ComplexService {
  constructor(private readonly em: EntityManager) {}

  async getComplexes(): Promise<ComplexDto[]> {
    const complexes = await this.em.findAll(Complex, {
      populate: [
        'complexCategory',
        'exercises',
        'exercises.exercise',
        'exercises.exercise.exerciseCategory',
      ],
    });

    if (!complexes || complexes.length === 0) {
      throw new NotFoundException('No complexes found');
    }

    return complexes.map((complex) => {
      return {
        id: complex.id,
        name: complex.name,
        complexCategory: {
          id: complex.complexCategory.id,
          name: complex.complexCategory.name,
        },
        exercises: complex.exercises.getItems().map((exerciseComplex) => {
          const exercise = exerciseComplex.exercise;
          return {
            id: exercise.id,
            name: exercise.name,
            exerciseCategory: {
              id: exercise.exerciseCategory.id,
              name: exercise.exerciseCategory.name,
            },
            description: exercise.description,
            video: exercise.video?.id,
            englishName: exercise.englishName,
            shortName: exercise.shortName,
            order: exerciseComplex.order,
            reps: exerciseComplex.reps,
          };
        }),
        description: complex.description,
      };
    });
  }

  async getComplex(id: string): Promise<ComplexDto> {
    const complex = await this.em.findOne(
      Complex,
      { id },
      {
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
        ],
      }
    );

    if (!complex) {
      throw new NotFoundException('Complex not found');
    }

    return {
      id: complex.id,
      name: complex.name,
      complexCategory: {
        id: complex.complexCategory.id,
        name: complex.complexCategory.name,
      },
      exercises: complex.exercises.getItems().map((exerciseComplex) => {
        const exercise = exerciseComplex.exercise;
        return {
          id: exercise.id,
          name: exercise.name,
          exerciseCategory: {
            id: exercise.exerciseCategory.id,
            name: exercise.exerciseCategory.name,
          },
          description: exercise.description,
          video: exercise.video?.id,
          englishName: exercise.englishName,
          shortName: exercise.shortName,
          order: exerciseComplex.order,
          reps: exerciseComplex.reps,
        };
      }),
      description: complex.description,
    };
  }

  async createComplex(complex: CreateComplex): Promise<ComplexDto> {
    if (!complex.name) {
      throw new BadRequestException('Complex name is required');
    }

    if (!complex.exercises) {
      throw new BadRequestException('Exercises are required');
    }

    const complexCategory = await this.em.findOne(ComplexCategory, {
      id: complex.complexCategory,
    });

    if (!complexCategory) {
      throw new NotFoundException(
        `Complex category with ID ${complex.complexCategory} not found`
      );
    }

    const complexToCreate = new Complex();

    complexToCreate.name = complex.name;
    complexToCreate.complexCategory = complexCategory;
    complexToCreate.description = complex.description || '';

    for (const exercise of complex.exercises) {
      const exerciseComplex = new ExerciseComplex();
      const exerciseFound = await this.em.findOne(Exercise, {
        id: exercise.exerciseId,
      });
      if (!exerciseFound) {
        throw new NotFoundException(
          `Exercise with ID ${exercise.exerciseId} not found`
        );
      }

      exerciseComplex.order = exercise.order;
      exerciseComplex.reps = exercise.reps;
      exerciseComplex.exercise = exerciseFound;
      exerciseComplex.complex = complexToCreate;

      // Ajouter à la collection
      complexToCreate.exercises.add(exerciseComplex);
    }

    if (complex.description) {
      complexToCreate.description = complex.description;
    }

    await this.em.persistAndFlush(complexToCreate);

    const complexCreated = await this.em.findOne(
      Complex,
      {
        id: complexToCreate.id,
      },
      {
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
        ],
      }
    );

    if (!complexCreated) {
      throw new NotFoundException('Complex not found');
    }

    return {
      id: complexCreated.id,
      name: complexCreated.name,
      description: complexCreated.description,
      complexCategory: {
        id: complexCreated.complexCategory.id,
        name: complexCreated.complexCategory.name,
      },
      exercises: complexCreated.exercises.getItems().map((exerciseComplex) => {
        const exercise = exerciseComplex.exercise;
        return {
          id: exercise.id,
          name: exercise.name,
          exerciseCategory: {
            id: exercise.exerciseCategory.id,
            name: exercise.exerciseCategory.name,
          },
          description: exercise.description,
          video: exercise.video?.id,
          englishName: exercise.englishName,
          shortName: exercise.shortName,
          order: exerciseComplex.order,
          reps: exerciseComplex.reps,
        };
      }),
    };
  }

  async updateComplex(id: string, complex: UpdateComplex): Promise<ComplexDto> {
    const complexToUpdate = await this.em.findOne(
      Complex,
      { id },
      {
        populate: ['exercises'],
      }
    );
    if (!complexToUpdate) {
      throw new NotFoundException('Complex not found');
    }

    if (complex.name) {
      complexToUpdate.name = complex.name;
    }

    if (complex.description !== undefined) {
      complexToUpdate.description = complex.description;
    }

    if (complex.complexCategory) {
      const complexCategory = await this.em.findOne(ComplexCategory, {
        id: complex.complexCategory,
      });
      if (!complexCategory) {
        throw new NotFoundException(
          `Complex category with ID ${complex.complexCategory} not found`
        );
      }
      complexToUpdate.complexCategory = complexCategory;
    }

    if (complex.exercises) {
      // On récupère d'abord toutes les relations existantes
      const existingExercises = complexToUpdate.exercises.getItems();

      // On les supprime explicitement
      for (const exerciseComplex of existingExercises) {
        this.em.remove(exerciseComplex);
      }

      // On flush pour s'assurer que les suppressions sont effectuées
      await this.em.flush();

      // On vide la collection
      complexToUpdate.exercises.removeAll();

      // On crée les nouvelles relations dans l'ordre spécifié
      for (const exerciseData of complex.exercises) {
        const exercise = await this.em.findOne(Exercise, {
          id: exerciseData.exerciseId,
        });

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

    // Flush final pour sauvegarder toutes les modifications
    await this.em.persistAndFlush(complexToUpdate);

    const updatedComplex = await this.em.findOne(
      Complex,
      { id },
      {
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
        ],
      }
    );

    if (!updatedComplex) {
      throw new NotFoundException('Complex not found');
    }

    return {
      id: updatedComplex.id,
      name: updatedComplex.name,
      description: updatedComplex.description,
      complexCategory: {
        id: updatedComplex.complexCategory.id,
        name: updatedComplex.complexCategory.name,
      },
      exercises: updatedComplex.exercises.getItems().map((exerciseComplex) => {
        const exercise = exerciseComplex.exercise;
        return {
          id: exercise.id,
          name: exercise.name,
          exerciseCategory: {
            id: exercise.exerciseCategory.id,
            name: exercise.exerciseCategory.name,
          },
          description: exercise.description,
          video: exercise.video?.id,
          englishName: exercise.englishName,
          shortName: exercise.shortName,
          order: exerciseComplex.order,
          reps: exerciseComplex.reps,
        };
      }),
    };
  }
}
