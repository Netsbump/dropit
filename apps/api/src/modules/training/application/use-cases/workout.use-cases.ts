import { CreateWorkout, UpdateWorkout, WorkoutDto } from '@dropit/schemas';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Athlete } from '../../../athletes/domain/athlete.entity';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';
import { TrainingSession } from '../../domain/training-session.entity';
import {
  WORKOUT_ELEMENT_TYPES,
  WorkoutElement,
} from '../../domain/workout-element.entity';
import { Workout } from '../../domain/workout.entity';
import { IWorkoutRepository, WORKOUT_REPO } from '../ports/workout.repository';
import { Inject } from '@nestjs/common';
import { WorkoutPresenter } from '../../interface/presenters/workout.presenter';
import { OrganizationService } from '../../../identity/organization/organization.service';
import { WorkoutMapper } from '../../interface/mappers/workout.mapper';
import { IWorkoutCategoryRepository, WORKOUT_CATEGORY_REPO } from '../ports/workout-category.repository';
import { EXERCISE_REPO, IExerciseRepository } from '../ports/exercise.repository';
import { COMPLEX_REPO, IComplexRepository } from '../ports/complex.repository';
import { IWorkoutElementRepository, WORKOUT_ELEMENT_REPO } from '../ports/workout-element.repository';
import { ATHLETE_REPO, IAthleteRepository } from '../../../athletes/application/ports/athlete.repository';
import { ITrainingSessionRepository, TRAINING_SESSION_REPO } from '../ports/training-session.repository';
import { ATHLETE_TRAINING_SESSION_REPO, IAthleteTrainingSessionRepository } from '../ports/athlete-training-session.repository';

@Injectable()
export class WorkoutUseCases {
  constructor(
    @Inject(WORKOUT_REPO)
    private readonly workoutRepository: IWorkoutRepository,
    @Inject(WORKOUT_CATEGORY_REPO)
    private readonly workoutCategoryRepository: IWorkoutCategoryRepository,
    @Inject(COMPLEX_REPO)
    private readonly complexRepository: IComplexRepository,
    @Inject(EXERCISE_REPO)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(WORKOUT_ELEMENT_REPO)
    private readonly workoutElementRepository: IWorkoutElementRepository,

    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    @Inject(TRAINING_SESSION_REPO)
    private readonly trainingSessionRepository: ITrainingSessionRepository,
    @Inject(ATHLETE_TRAINING_SESSION_REPO)
    private readonly athleteTrainingSessionRepository: IAthleteTrainingSessionRepository,
    private readonly organizationService: OrganizationService
  ) {}

  async getWorkouts(organizationId: string, userId: string) {
    try {
      //1. Check if user is coach of the organization
      const isUserCoach = await this.organizationService.isUserCoach(organizationId, userId);

      if (!isUserCoach) {
        throw new ForbiddenException('User is not coach');
      }

      //2. Get workouts from repository
      const workouts = await this.workoutRepository.getAll(organizationId);

      if (!workouts) {
        throw new NotFoundException('Workouts not found');
      }

      //3. Map workouts to DTO
      const workoutsDto = WorkoutMapper.toDtoList(workouts);

      //4. Present workouts
      return WorkoutPresenter.presentList(workoutsDto);
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }

  async getWorkout(workoutId: string, organizationId: string, userId: string) {
    try {
      //1. Check if user is coach of the organization
      const isUserCoach = await this.organizationService.isUserCoach(organizationId, userId);

      if (!isUserCoach) {
        throw new ForbiddenException('User is not coach');
      }

      //2. Get workout from repository
      const workout = await this.workoutRepository.getOne(workoutId, organizationId);

      if (!workout) {
        throw new NotFoundException('Workout not found');
      }

      //3. Map workout to DTO
      const workoutDto = WorkoutMapper.toDto(workout);

      //4. Present workout
      return WorkoutPresenter.presentOne(workoutDto);
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }

  async getWorkoutWithDetails(id: string, organizationId: string, userId: string) {
    try {
      //1. Check if user is coach of the organization
      const isUserCoach = await this.organizationService.isUserCoach(organizationId, userId);

      if (!isUserCoach) {
        throw new ForbiddenException('User is not coach');
      }

      //2. Get workout from repository
      const workout = await this.workoutRepository.getOneWithDetails(id, organizationId);

      if (!workout) {
        throw new NotFoundException('Workout not found');
      }

      //3. Map workout to DTO
      const workoutDto = WorkoutMapper.toDto(workout);

      //4. Present workout
      return WorkoutPresenter.presentOne(workoutDto);
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }

  async createWorkout(workout: CreateWorkout, organizationId: string, userId: string) {
    try {
      //1. Check if user is coach of the organization
      const isUserCoach = await this.organizationService.isUserCoach(organizationId, userId);

      if (!isUserCoach) {
        throw new ForbiddenException('User is not coach');
      }

      //2. Check if workout has at least one element
    if (!workout.elements || workout.elements.length === 0) {
      throw new BadRequestException('Workout must have at least one element');
    }

    const category = await this.workoutCategoryRepository.getOne(workout.workoutCategory);

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
        const exercise = await this.exerciseRepository.getOne(element.id, organizationId);
        if (!exercise) {
          throw new NotFoundException(
            `Exercise with ID ${element.id} not found`
          );
        }
        workoutElement.exercise = exercise;
      } else {
        const complex = await this.complexRepository.getOne(element.id, organizationId);
        if (!complex) {
          throw new NotFoundException(
            `Complex with ID ${element.id} not found`
          );
        }
        workoutElement.complex = complex;
      }

      workoutElement.workout = workoutToCreate;
      await this.workoutElementRepository.save(workoutElement);
    }

    const createdWorkout = await this.workoutRepository.save(workoutToCreate);

    // Si une session d'entrainement est demandée, la créer
    if (workout.trainingSession) {
      const organization = await this.organizationService.getOrganizationById(organizationId);
      
      // Vérifier que tous les athlètes existent
      const athletes: Athlete[] = [];
      for (const athleteId of workout.trainingSession.athleteIds) {
        const athlete = await this.athleteRepository.getOne(athleteId);
        if (!athlete) {
          throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
        }
        athletes.push(athlete);
      }

      const trainingSession = new TrainingSession();
      trainingSession.workout = createdWorkout;
      trainingSession.organization = organization;
      trainingSession.scheduledDate = new Date(workout.trainingSession.scheduledDate);

      await this.trainingSessionRepository.save(trainingSession);

      // Créer les liens avec les athlètes
      for (const athlete of athletes) {
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = athlete;
        athleteTrainingSession.trainingSession = trainingSession;
        await this.athleteTrainingSessionRepository.save(athleteTrainingSession);
      }

      await this.trainingSessionRepository.save(trainingSession);
    }

    
     const workoutCreated = await this.workoutRepository.getOneWithDetails(createdWorkout.id, organizationId);

     if (!workoutCreated) {
      throw new NotFoundException('Workout not found');
     }

     const workoutCreatedDto = WorkoutMapper.toDto(workoutCreated);

     return WorkoutPresenter.presentOne(workoutCreatedDto);
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }

  async updateWorkout(id: string, workout: UpdateWorkout, organizationId: string, userId: string) {
    try {
      //1. Check if user is coach of the organization
      const isUserCoach = await this.organizationService.isUserCoach(organizationId, userId);

      if (!isUserCoach) {
        throw new ForbiddenException('User is not coach');
      }

      //2. Get workout to update from repository
      const workoutToUpdate = await this.workoutRepository.getOne(id, organizationId);
      
      if (!workoutToUpdate) {
        throw new NotFoundException('Workout not found');
      }

      //3. Update workout
      if (workout.title) {
        workoutToUpdate.title = workout.title;
      }

      if (workout.description !== undefined) {
        workoutToUpdate.description = workout.description;
      }

      if (workout.workoutCategory) {
        const category = await this.workoutCategoryRepository.getOne(workout.workoutCategory);
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
          await this.workoutElementRepository.remove(element.id, organizationId);
        }

        await this.workoutRepository.save(workoutToUpdate);
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
            const exercise = await this.exerciseRepository.getOne(element.id, organizationId);
            if (!exercise) {
              throw new NotFoundException(
                `Exercise with ID ${element.id} not found`
              );
            }
            workoutElement.exercise = exercise;
          } else {
            const complex = await this.complexRepository.getOne(element.id, organizationId);
            if (!complex) {
              throw new NotFoundException(
                `Complex with ID ${element.id} not found`
              );
            }
            workoutElement.complex = complex;
          }

          await this.workoutElementRepository.save(workoutElement);
        }
      }

      await this.workoutRepository.save(workoutToUpdate);

      //4. Get updated workout
      const workoutUpdated = await this.workoutRepository.getOneWithDetails(id, organizationId);

      if (!workoutUpdated) {
        throw new NotFoundException('Workout not found');
      }

      const workoutUpdatedDto = WorkoutMapper.toDto(workoutUpdated);

      return WorkoutPresenter.presentOne(workoutUpdatedDto);
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }

  async deleteWorkout(workoutId: string, organizationId: string, userId: string) {
    try {
      //1. Check if the user is admin of this organization
     const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);

     if (!isAdmin) {
       throw new ForbiddenException('User is not admin of this organization');
     }

      //2. Get workout to delete from repository
      const workoutToDelete = await this.workoutRepository.getOne(workoutId, organizationId);

      if (!workoutToDelete) {
        throw new NotFoundException('Workout not found');
      }

      //3. Delete workout
      await this.workoutRepository.remove(workoutToDelete.id, organizationId);

      //4. Return success message
      return WorkoutPresenter.presentSuccess('Workout deleted successfully');
    } catch (error) {
      return WorkoutPresenter.presentError(error as Error);
    }
  }
}
