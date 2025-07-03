import { CreateWorkout, UpdateWorkout, WorkoutDto } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Athlete } from '../../members/athlete/domain/athlete.entity';
import { AthleteTrainingSession } from '../../performance/athlete-training-session/athlete-training-session.entity';
import { TrainingSession } from '../../performance/training-session/training-session.entity';
import { Complex } from '../complex/complex.entity';
import { Exercise } from '../exercise/exercise.entity';
import { WorkoutCategory } from '../workout-category/workout-category.entity';
import {
  WORKOUT_ELEMENT_TYPES,
  WorkoutElement,
} from '../workout-element/workout-element.entity';
import { Workout } from './workout.entity';
import { WorkoutMapper } from './workout.mapper';
import { OrganizationService } from '../../members/organization/organization.service';

@Injectable()
export class WorkoutService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService
  ) {}

  async getWorkouts(organizationId: string): Promise<WorkoutDto[]> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const workouts = await this.em.find(Workout, {
      ...filterConditions,
    }, {
      populate: [
        'category',
        'elements',
        'elements.exercise',
        'elements.exercise.exerciseCategory',
        'elements.complex',
        'elements.complex.complexCategory',
        'elements.complex.exercises',
        'elements.complex.exercises.exercise',
        'elements.complex.exercises.exercise.exerciseCategory',
      ],
    });

    if (!workouts || workouts.length === 0) {
      throw new NotFoundException('No workouts found');
    }

    const formattedWorkouts: WorkoutDto[] = [];

    for (const workout of workouts) {
      const formattedElements = [];

      for (const element of workout.elements.getItems()) {
        const baseElement = {
          id: element.id,
          order: element.order,
          reps: element.reps,
          sets: element.sets,
          rest: element.rest,
          startWeight_percent: element.startWeight_percent,
        };

        if (
          element.type === WORKOUT_ELEMENT_TYPES.EXERCISE &&
          element.exercise
        ) {
          formattedElements.push({
            ...baseElement,
            type: 'exercise' as const,
            exercise: {
              id: element.exercise.id,
              name: element.exercise.name,
              description: element.exercise.description,
              exerciseCategory: {
                id: element.exercise.exerciseCategory.id,
                name: element.exercise.exerciseCategory.name,
              },
              video: element.exercise.video?.id,
              englishName: element.exercise.englishName,
              shortName: element.exercise.shortName,
            },
          });
        } else if (
          element.type === WORKOUT_ELEMENT_TYPES.COMPLEX &&
          element.complex
        ) {
          formattedElements.push({
            ...baseElement,
            type: 'complex' as const,
            complex: {
              id: element.complex.id,
              name: element.complex.name,
              description: element.complex.description,
              complexCategory: {
                id: element.complex.complexCategory.id,
                name: element.complex.complexCategory.name,
              },
              exercises: element.complex.exercises.getItems().map((ex) => ({
                id: ex.exercise.id,
                name: ex.exercise.name,
                description: ex.exercise.description,
                exerciseCategory: {
                  id: ex.exercise.exerciseCategory.id,
                  name: ex.exercise.exerciseCategory.name,
                },
                video: ex.exercise.video?.id,
                englishName: ex.exercise.englishName,
                shortName: ex.exercise.shortName,
                order: ex.order,
                reps: ex.reps,
              })),
            },
          });
        }
      }

      formattedWorkouts.push({
        id: workout.id,
        title: workout.title,
        workoutCategory: workout.category.name,
        description: workout.description,
        elements: formattedElements,
      });
    }

    return formattedWorkouts;
  }

  async getWorkout(id: string, organizationId: string): Promise<WorkoutDto> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const workout = await this.em.findOne(
      Workout,
      {
        id,
        ...filterConditions,
      },
      {
        populate: [
          'category',
          'elements',
          'elements.exercise',
          'elements.exercise.exerciseCategory',
          'elements.complex',
          'elements.complex.complexCategory',
          'elements.complex.exercises',
          'elements.complex.exercises.exercise',
          'elements.complex.exercises.exercise.exerciseCategory',
        ],
      }
    );

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return WorkoutMapper.toDto(workout);
  }

  async createWorkout(workout: CreateWorkout, organizationId: string, userId: string): Promise<WorkoutDto> {
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
    workoutToCreate.description = workout.description || '';
    workoutToCreate.category = category;

    // Assigner le coach créateur
    const user = await this.organizationService.getUserById(userId);
    workoutToCreate.createdBy = user;

    for (const element of workout.elements) {
      const workoutElement = new WorkoutElement();
      workoutElement.type = element.type;
      workoutElement.order = element.order;
      workoutElement.sets = element.sets;
      workoutElement.reps = element.reps;
      workoutElement.rest = element.rest;
      workoutElement.duration = element.duration;
      workoutElement.startWeight_percent = element.startWeight_percent;
      workoutElement.endWeight_percent = element.endWeight_percent;

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

    // Si une session d'entrainement est demandée, la créer
    if (workout.trainingSession) {
      const organization = await this.organizationService.getOrganizationById(organizationId);
      
      // Vérifier que tous les athlètes existent
      const athletes: Athlete[] = [];
      for (const athleteId of workout.trainingSession.athleteIds) {
        const athlete = await this.em.findOne(Athlete, { id: athleteId });
        if (!athlete) {
          throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
        }
        athletes.push(athlete);
      }

      const trainingSession = new TrainingSession();
      trainingSession.workout = workoutToCreate;
      trainingSession.organization = organization;
      trainingSession.scheduledDate = new Date(workout.trainingSession.scheduledDate);

      await this.em.persistAndFlush(trainingSession);

      // Créer les liens avec les athlètes
      for (const athlete of athletes) {
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = athlete;
        athleteTrainingSession.trainingSession = trainingSession;
        this.em.persist(athleteTrainingSession);
      }

      await this.em.flush();
    }

    return this.getWorkout(workoutToCreate.id, organizationId);
  }

  async updateWorkout(id: string, workout: UpdateWorkout, organizationId: string): Promise<WorkoutDto> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const workoutToUpdate = await this.em.findOne(
      Workout,
      {
        id,
        ...filterConditions,
      },
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
        this.em.remove(element);
      }

      await this.em.flush();
      workoutToUpdate.elements.removeAll();

      // Créer les nouveaux éléments
      for (const element of workout.elements) {
        const workoutElement = new WorkoutElement();
        workoutElement.type = element.type;
        workoutElement.order = element.order;
        workoutElement.sets = element.sets;
        workoutElement.reps = element.reps;
        workoutElement.rest = element.rest;
        workoutElement.duration = element.duration;
        workoutElement.startWeight_percent = element.startWeight_percent;
        workoutElement.endWeight_percent = element.endWeight_percent;
        workoutElement.workout = workoutToUpdate;

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

    return this.getWorkout(id, organizationId);
  }

  async deleteWorkout(id: string, organizationId: string): Promise<void> {
    const { filterConditions } = await this.organizationService.getCoachFilterData(organizationId);

    const workoutToDelete = await this.em.findOne(
      Workout,
      {
        id,
        ...filterConditions,
      },
      { populate: ['elements'] }
    );
    if (!workoutToDelete) {
      throw new NotFoundException('Workout not found');
    }

    // Supprimer d'abord les éléments et leurs paramètres
    const elements = workoutToDelete.elements.getItems();
    for (const element of elements) {
      this.em.remove(element);
    }

    await this.em.removeAndFlush(workoutToDelete);
  }
}
