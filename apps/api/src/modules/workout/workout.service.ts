import { CreateWorkout, UpdateWorkout, WorkoutDto } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Complex } from '../../entities/complex.entity';
import { Exercise } from '../../entities/exercise.entity';
import { TrainingParams } from '../../entities/training-params.entity';
import { WorkoutCategory } from '../../entities/workout-category.entity';
import {
  WORKOUT_ELEMENT_TYPES,
  WorkoutElement,
} from '../../entities/workout-element.entity';
import { Workout } from '../../entities/workout.entity';

@Injectable()
export class WorkoutService {
  constructor(private readonly em: EntityManager) {}

  async getWorkouts(): Promise<WorkoutDto[]> {
    const workouts = await this.em.findAll(Workout, {
      populate: [
        'category',
        'elements',
        'elements.trainingParams',
        'elements.exercise',
        'elements.exercise.exerciseCategory',
        'elements.complex',
        'elements.complex.exercises',
        'elements.complex.exercises.exercise',
        'elements.complex.exercises.exercise.exerciseCategory',
        'elements.complex.exercises.trainingParams',
      ],
    });

    if (!workouts || workouts.length === 0) {
      throw new NotFoundException('No workouts found');
    }

    return workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      workoutCategory: workout.category.name,
      description: workout.description,
      elements: workout.elements.getItems().map((element) => {
        const baseElement = {
          id: element.id,
          type: element.type,
          order: element.order,
          trainingParams: {
            sets: element.trainingParams.sets,
            reps: element.trainingParams.reps,
            rest: element.trainingParams.rest,
            startWeight_percent: element.trainingParams.startWeight_percent,
          },
        };

        if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE) {
          return {
            ...baseElement,
            exercise: element.exercise,
          };
        }

        // Si c'est un complex, on inclut ses exercices
        if (!element.complex || !element.complex.exercises) {
          throw new Error(
            `Complex ${element.id} is missing or has no exercises`
          );
        }

        // Si c'est un complex, on inclut ses exercices
        return {
          ...baseElement,
          complex: {
            ...element.complex,
            elements: element.complex.exercises
              .getItems()
              .map((complexElement) => ({
                id: complexElement.exercise.id,
                exercise: complexElement.exercise,
                trainingParams: complexElement.trainingParams,
              })),
          },
        };
      }),
    }));
  }

  async getWorkout(id: string): Promise<WorkoutDto> {
    const workout = await this.em.findOne(
      Workout,
      { id },
      {
        populate: [
          'category',
          'elements',
          'elements.trainingParams',
          'elements.exercise',
          'elements.exercise.exerciseCategory',
          'elements.complex',
          'elements.complex.exercises',
          'elements.complex.exercises.exercise',
          'elements.complex.exercises.exercise.exerciseCategory',
          'elements.complex.exercises.trainingParams',
        ],
      }
    );

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return {
      id: workout.id,
      title: workout.title,
      workoutCategory: workout.category.name,
      description: workout.description,
      elements: workout.elements.getItems().map((element) => {
        const baseElement = {
          id: element.id,
          type: element.type,
          order: element.order,
          trainingParams: {
            sets: element.trainingParams.sets,
            reps: element.trainingParams.reps,
            rest: element.trainingParams.rest,
            startWeight_percent: element.trainingParams.startWeight_percent,
          },
        };

        if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE) {
          return {
            ...baseElement,
            exercise: element.exercise,
          };
        }

        // Si c'est un complex, on inclut ses exercices
        if (!element.complex || !element.complex.exercises) {
          throw new Error(
            `Complex ${element.id} is missing or has no exercises`
          );
        }

        return {
          ...baseElement,
          complex: {
            ...element.complex,
            elements: element.complex.exercises
              .getItems()
              .map((complexElement) => ({
                id: complexElement.exercise.id,
                exercise: complexElement.exercise,
                trainingParams: complexElement.trainingParams,
              })),
          },
        };
      }),
    };
  }

  async createWorkout(workout: CreateWorkout): Promise<WorkoutDto> {
    if (!workout.title) {
      throw new BadRequestException('Workout title is required');
    }

    if (!workout.elements || workout.elements.length === 0) {
      throw new BadRequestException('Workout must have at least one element');
    }

    const category = await this.em.findOne(WorkoutCategory, {
      id: workout.workoutCategory,
    });

    if (!category) {
      throw new NotFoundException(
        `Workout category with ID ${workout.workoutCategory} not found`
      );
    }

    const workoutToCreate = new Workout();
    workoutToCreate.title = workout.title;
    workoutToCreate.category = category;
    workoutToCreate.description = workout.description || '';

    // Créer les éléments du workout
    for (const element of workout.elements) {
      const workoutElement = new WorkoutElement();
      workoutElement.type = element.type;
      workoutElement.order = element.order;

      // Créer les paramètres d'entraînement
      const trainingParams = new TrainingParams();
      trainingParams.sets = element.trainingParams.sets;
      trainingParams.reps = element.trainingParams.reps;
      trainingParams.rest = element.trainingParams.rest;
      trainingParams.startWeight_percent =
        element.trainingParams.startWeight_percent;

      this.em.persist(trainingParams);
      workoutElement.trainingParams = trainingParams;

      if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE) {
        const exercise = await this.em.findOne(Exercise, {
          id: element.id,
        });
        if (!exercise) {
          throw new NotFoundException(
            `Exercise with ID ${element.id} not found`
          );
        }
        workoutElement.exercise = exercise;
      } else {
        const complex = await this.em.findOne(Complex, {
          id: element.id,
        });
        if (!complex) {
          throw new NotFoundException(
            `Complex with ID ${element.id} not found`
          );
        }
        workoutElement.complex = complex;
      }

      workoutElement.workout = workoutToCreate;
      this.em.persist(workoutElement);
    }

    await this.em.persistAndFlush(workoutToCreate);

    return this.getWorkout(workoutToCreate.id);
  }

  async updateWorkout(id: string, workout: UpdateWorkout): Promise<WorkoutDto> {
    const workoutToUpdate = await this.em.findOne(
      Workout,
      { id },
      { populate: ['elements'] }
    );
    if (!workoutToUpdate) {
      throw new NotFoundException('Workout not found');
    }

    if (workout.title) {
      workoutToUpdate.title = workout.title;
    }

    if (workout.description !== undefined) {
      workoutToUpdate.description = workout.description;
    }

    if (workout.workoutCategory) {
      const category = await this.em.findOne(WorkoutCategory, {
        id: workout.workoutCategory,
      });
      if (!category) {
        throw new NotFoundException(
          `Workout category with ID ${workout.workoutCategory} not found`
        );
      }
      workoutToUpdate.category = category;
    }

    if (workout.elements) {
      // Supprimer les anciens éléments
      const existingElements = workoutToUpdate.elements.getItems();
      for (const element of existingElements) {
        const params = element.trainingParams;
        this.em.remove(element);
        if (params) {
          this.em.remove(params);
        }
      }

      await this.em.flush();
      workoutToUpdate.elements.removeAll();

      // Créer les nouveaux éléments
      for (const element of workout.elements) {
        const workoutElement = new WorkoutElement();
        workoutElement.type = element.type;
        workoutElement.order = element.order;
        workoutElement.workout = workoutToUpdate;

        // Créer les paramètres d'entraînement
        const trainingParams = new TrainingParams();
        trainingParams.sets = element.trainingParams.sets;
        trainingParams.reps = element.trainingParams.reps;
        trainingParams.rest = element.trainingParams.rest;
        trainingParams.startWeight_percent =
          element.trainingParams.startWeight_percent;

        this.em.persist(trainingParams);
        workoutElement.trainingParams = trainingParams;

        if (element.type === WORKOUT_ELEMENT_TYPES.EXERCISE) {
          const exercise = await this.em.findOne(Exercise, {
            id: element.id,
          });
          if (!exercise) {
            throw new NotFoundException(
              `Exercise with ID ${element.id} not found`
            );
          }
          workoutElement.exercise = exercise;
        } else {
          const complex = await this.em.findOne(Complex, {
            id: element.id,
          });
          if (!complex) {
            throw new NotFoundException(
              `Complex with ID ${element.id} not found`
            );
          }
          workoutElement.complex = complex;
        }

        this.em.persist(workoutElement);
      }
    }

    await this.em.flush();

    return this.getWorkout(id);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workoutToDelete = await this.em.findOne(
      Workout,
      { id },
      { populate: ['elements'] }
    );
    if (!workoutToDelete) {
      throw new NotFoundException('Workout not found');
    }

    // Supprimer d'abord les éléments et leurs paramètres
    const elements = workoutToDelete.elements.getItems();
    for (const element of elements) {
      const params = element.trainingParams;
      await this.em.remove(element);
      if (params) {
        await this.em.remove(params);
      }
    }

    await this.em.removeAndFlush(workoutToDelete);
  }
}
