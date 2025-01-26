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
import { TrainingParams } from '../../entities/training-params.entity';

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
        'exercises.trainingParams',
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
            trainingParams: {
              id: exerciseComplex.trainingParams.id,
              sets: exerciseComplex.trainingParams.sets,
              reps: exerciseComplex.trainingParams.reps,
              rest: exerciseComplex.trainingParams.rest,
              startWeight_percent:
                exerciseComplex.trainingParams.startWeight_percent,
              endWeight_percent:
                exerciseComplex.trainingParams.endWeight_percent,
              duration: exerciseComplex.trainingParams.duration,
            },
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
          'exercises.trainingParams',
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
          trainingParams: {
            id: exerciseComplex.trainingParams.id,
            sets: exerciseComplex.trainingParams.sets,
            reps: exerciseComplex.trainingParams.reps,
            rest: exerciseComplex.trainingParams.rest,
            duration: exerciseComplex.trainingParams.duration,
            startWeight_percent:
              exerciseComplex.trainingParams.startWeight_percent,
            endWeight_percent: exerciseComplex.trainingParams.endWeight_percent,
          },
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

      // Créer les paramètres d'entraînement
      const trainingParams = new TrainingParams();
      trainingParams.sets = exercise.trainingParams.sets ?? 1;
      trainingParams.reps = exercise.trainingParams.reps ?? 1;
      trainingParams.rest = exercise.trainingParams.rest;
      trainingParams.startWeight_percent =
        exercise.trainingParams.startWeight_percent;
      trainingParams.endWeight_percent =
        exercise.trainingParams.endWeight_percent;

      this.em.persist(trainingParams);

      exerciseComplex.order = exercise.order;
      exerciseComplex.exercise = exerciseFound;
      exerciseComplex.complex = complexToCreate;
      exerciseComplex.trainingParams = trainingParams;

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
          'exercises.trainingParams',
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
          trainingParams: {
            id: exerciseComplex.trainingParams.id,
            sets: exerciseComplex.trainingParams.sets,
            reps: exerciseComplex.trainingParams.reps,
            rest: exerciseComplex.trainingParams.rest,
            duration: exerciseComplex.trainingParams.duration,
            startWeight_percent:
              exerciseComplex.trainingParams.startWeight_percent,
            endWeight_percent: exerciseComplex.trainingParams.endWeight_percent,
          },
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

      // On les supprime explicitement avec leurs trainingParams
      for (const exerciseComplex of existingExercises) {
        const params = exerciseComplex.trainingParams;
        this.em.remove(exerciseComplex);
        if (params) {
          this.em.remove(params);
        }
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

        // Créer les nouveaux paramètres
        const trainingParams = new TrainingParams();
        trainingParams.sets = exerciseData.trainingParams.sets ?? 1;
        trainingParams.reps = exerciseData.trainingParams.reps ?? 1;
        trainingParams.rest = exerciseData.trainingParams.rest;
        trainingParams.startWeight_percent =
          exerciseData.trainingParams.startWeight_percent;
        trainingParams.endWeight_percent =
          exerciseData.trainingParams.endWeight_percent;

        this.em.persist(trainingParams);

        const exerciseComplex = new ExerciseComplex();
        exerciseComplex.exercise = exercise;
        exerciseComplex.complex = complexToUpdate;
        exerciseComplex.order = exerciseData.order;
        exerciseComplex.trainingParams = trainingParams;

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
          'exercises.trainingParams',
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
          trainingParams: {
            id: exerciseComplex.trainingParams.id,
            sets: exerciseComplex.trainingParams.sets,
            reps: exerciseComplex.trainingParams.reps,
            rest: exerciseComplex.trainingParams.rest,
            duration: exerciseComplex.trainingParams.duration,
            startWeight_percent:
              exerciseComplex.trainingParams.startWeight_percent,
            endWeight_percent: exerciseComplex.trainingParams.endWeight_percent,
          },
        };
      }),
    };
  }
}
