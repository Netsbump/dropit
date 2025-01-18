import { ComplexDto, CreateComplex } from '@dropit/schemas';
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
      populate: ['complexCategory', 'exercises', 'exercises.exercise'],
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
          };
        }),
      };
    });
  }

  async getComplex(id: string): Promise<ComplexDto> {
    const complex = await this.em.findOne(
      Complex,
      { id },
      {
        populate: ['complexCategory', 'exercises', 'exercises.exercise'],
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
        };
      }),
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
      exerciseComplex.exercise = exerciseFound;
      exerciseComplex.complex = complexToCreate; // Important : définir la relation inverse

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
      { populate: ['complexCategory', 'exercises', 'exercises.exercise'] }
    );

    if (!complexCreated) {
      throw new NotFoundException('Complex not found');
    }

    return {
      id: complexCreated.id,
      name: complexCreated.name,
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
        };
      }),
    };
  }
}
