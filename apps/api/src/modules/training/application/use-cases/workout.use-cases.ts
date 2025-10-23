import { CreateWorkout, UpdateWorkout } from '@dropit/schemas';
import { Athlete } from '../../../athletes/domain/athlete.entity';
import { AthleteTrainingSession } from '../../domain/athlete-training-session.entity';
import { TrainingSession } from '../../domain/training-session.entity';
import {
  WORKOUT_ELEMENT_TYPES,
  WorkoutElement,
} from '../../domain/workout-element.entity';
import { Workout } from '../../domain/workout.entity';
import { IWorkoutRepository } from '../ports/workout.repository.port';
import { IMemberUseCases } from '../../../identity/application/ports/member-use-cases.port';
import { IUserUseCases } from '../../../identity/application/ports/user-use-cases.port';
import { IOrganizationUseCases } from '../../../identity/application/ports/organization-use-cases.port';
import { IWorkoutCategoryRepository } from '../ports/workout-category.repository.port';
import { IExerciseRepository } from '../ports/exercise.repository.port';
import { IComplexRepository } from '../ports/complex.repository.port';
import { IWorkoutElementRepository } from '../ports/workout-element.repository.port';
import { IAthleteRepository } from '../../../athletes/application/ports/athlete.repository.port';
import { ITrainingSessionRepository } from '../ports/training-session.repository.port';
import { IAthleteTrainingSessionRepository } from '../ports/athlete-training-session.repository.port';
import { IWorkoutUseCases } from '../ports/workout-use-cases.port';
import {
  WorkoutAccessDeniedException,
  WorkoutNotFoundException,
  WorkoutValidationException,
  WorkoutCategoryNotFoundException,
  ExerciseNotFoundException,
  ComplexNotFoundException,
  AthleteNotFoundException,
} from '../exceptions/workout.exceptions';

/**
 * Workout Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of workout business logic.
 * No NestJS dependencies - pure TypeScript.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
export class WorkoutUseCases implements IWorkoutUseCases {
  constructor(
    private readonly workoutRepository: IWorkoutRepository,
    private readonly workoutCategoryRepository: IWorkoutCategoryRepository,
    private readonly complexRepository: IComplexRepository,
    private readonly exerciseRepository: IExerciseRepository,
    private readonly workoutElementRepository: IWorkoutElementRepository,
    private readonly athleteRepository: IAthleteRepository,
    private readonly trainingSessionRepository: ITrainingSessionRepository,
    private readonly athleteTrainingSessionRepository: IAthleteTrainingSessionRepository,
    private readonly userUseCases: IUserUseCases,
    private readonly memberUseCases: IMemberUseCases,
    private readonly organizationUseCases: IOrganizationUseCases
  ) {}

  async getWorkouts(organizationId: string, userId: string): Promise<Workout[]> {
    //1. Check if user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get workouts from repository
    const workouts = await this.workoutRepository.getAll(coachFilterConditions);

    if (!workouts) {
      throw new WorkoutNotFoundException('Workouts not found');
    }

    return workouts;
  }

  async getWorkout(workoutId: string, organizationId: string, userId: string): Promise<Workout> {
    //1. Check if user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get workout from repository
    const workout = await this.workoutRepository.getOne(workoutId, coachFilterConditions);

    if (!workout) {
      throw new WorkoutNotFoundException('Workout not found or access denied');
    }

    return workout;
  }

  async getWorkoutWithDetails(id: string, organizationId: string, userId: string): Promise<Workout> {
    //1. Check if user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get workout from repository
    const workout = await this.workoutRepository.getOneWithDetails(id, coachFilterConditions);

    if (!workout) {
      throw new WorkoutNotFoundException('Workout not found or access denied');
    }

    return workout;
  }

  async createWorkout(workout: CreateWorkout, organizationId: string, userId: string): Promise<Workout> {
    //1. Check if user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Check if workout has at least one element
    if (!workout.elements || workout.elements.length === 0) {
      throw new WorkoutValidationException('Workout must have at least one element');
    }

    //3. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //4. Get workout category
    const category = await this.workoutCategoryRepository.getOne(workout.workoutCategory, coachFilterConditions);

    if (!category) {
      throw new WorkoutCategoryNotFoundException(
        `Workout category with ID ${workout.workoutCategory} not found or access denied`
      );
    }

    //5. Create workout
    const workoutToCreate = new Workout();
    workoutToCreate.title = workout.title;
    workoutToCreate.description = workout.description || '';
    workoutToCreate.category = category;

    //6. Assign creator user
    const user = await this.userUseCases.getOne(userId);
    workoutToCreate.createdBy = user;

    //7. Create workout elements
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
        const exercise = await this.exerciseRepository.getOne(element.id, coachFilterConditions);
        if (!exercise) {
          throw new ExerciseNotFoundException(
            `Exercise with ID ${element.id} not found or access denied`
          );
        }
        workoutElement.exercise = exercise;
      } else {
        const complex = await this.complexRepository.getOne(element.id, coachFilterConditions);
        if (!complex) {
          throw new ComplexNotFoundException(
            `Complex with ID ${element.id} not found or access denied`
          );
        }
        workoutElement.complex = complex;
      }

      workoutElement.workout = workoutToCreate;
      await this.workoutElementRepository.save(workoutElement);
    }

    //8. Save workout
    const createdWorkout = await this.workoutRepository.save(workoutToCreate);

    //9. Create training session if requested
    if (workout.trainingSession) {
      const organization = await this.organizationUseCases.getOne(organizationId);

      //9.1. Check if all athletes exist
      const athletes: Athlete[] = [];
      for (const athleteId of workout.trainingSession.athleteIds) {
        const athlete = await this.athleteRepository.getOne(athleteId);
        if (!athlete) {
          throw new AthleteNotFoundException(`Athlete with ID ${athleteId} not found`);
        }
        athletes.push(athlete);
      }

      //9.2. Create training session
      const trainingSession = new TrainingSession();
      trainingSession.workout = createdWorkout;
      trainingSession.organization = organization;
      trainingSession.scheduledDate = new Date(workout.trainingSession.scheduledDate);

      await this.trainingSessionRepository.save(trainingSession);

      //9.3. Create links with athletes
      for (const athlete of athletes) {
        const athleteTrainingSession = new AthleteTrainingSession();
        athleteTrainingSession.athlete = athlete;
        athleteTrainingSession.trainingSession = trainingSession;
        await this.athleteTrainingSessionRepository.save(athleteTrainingSession);
      }

      //9.4. Save training session
      await this.trainingSessionRepository.save(trainingSession);
    }

    //10. Get created workout
    const workoutCreated = await this.workoutRepository.getOneWithDetails(createdWorkout.id, coachFilterConditions);

    if (!workoutCreated) {
      throw new WorkoutNotFoundException('Workout not found');
    }

    return workoutCreated;
  }

  async updateWorkout(id: string, workout: UpdateWorkout, organizationId: string, userId: string): Promise<Workout> {
    //1. Check if user is coach of the organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get workout to update from repository
    const workoutToUpdate = await this.workoutRepository.getOne(id, coachFilterConditions);

    if (!workoutToUpdate) {
      throw new WorkoutNotFoundException('Workout not found or access denied');
    }

    //4. Update workout
    if (workout.title) {
      workoutToUpdate.title = workout.title;
    }

    if (workout.description !== undefined) {
      workoutToUpdate.description = workout.description;
    }

    if (workout.workoutCategory) {
      const category = await this.workoutCategoryRepository.getOne(workout.workoutCategory, coachFilterConditions);
      if (!category) {
        throw new WorkoutCategoryNotFoundException(
          `Workout category with ID ${workout.workoutCategory} not found or access denied`
        );
      }
      workoutToUpdate.category = category;
    }

    //5. Update workout elements
    if (workout.elements) {
      //5.1. Delete old elements
      const existingElements = workoutToUpdate.elements.getItems();
      for (const element of existingElements) {
        await this.workoutElementRepository.remove(element.id, organizationId);
      }

      //5.2. Save workout
      await this.workoutRepository.save(workoutToUpdate);
      workoutToUpdate.elements.removeAll();

      //5.3. Create new elements
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
          const exercise = await this.exerciseRepository.getOne(element.id, coachFilterConditions);
          if (!exercise) {
            throw new ExerciseNotFoundException(
              `Exercise with ID ${element.id} not found or access denied`
            );
          }
          workoutElement.exercise = exercise;
        } else {
          const complex = await this.complexRepository.getOne(element.id, coachFilterConditions);
          if (!complex) {
            throw new ComplexNotFoundException(
              `Complex with ID ${element.id} not found or access denied`
            );
          }
          workoutElement.complex = complex;
        }

        await this.workoutElementRepository.save(workoutElement);
      }
    }

    //6. Save workout
    await this.workoutRepository.save(workoutToUpdate);

    //7. Get updated workout
    const workoutUpdated = await this.workoutRepository.getOneWithDetails(id, coachFilterConditions);

    if (!workoutUpdated) {
      throw new WorkoutNotFoundException('Workout not found');
    }

    return workoutUpdated;
  }

  async deleteWorkout(workoutId: string, organizationId: string, userId: string): Promise<void> {
    //1. Check if the user is coach of this organization
    const isCoach = await this.memberUseCases.isUserCoachInOrganization(userId, organizationId);

    if (!isCoach) {
      throw new WorkoutAccessDeniedException('User is not coach of this organization');
    }

    //2. Get filter conditions via use case
    const coachFilterConditions = await this.memberUseCases.getCoachFilterConditions(organizationId);

    //3. Get workout to delete from repository
    const workoutToDelete = await this.workoutRepository.getOne(workoutId, coachFilterConditions);

    if (!workoutToDelete) {
      throw new WorkoutNotFoundException('Workout not found or access denied');
    }

    //4. Delete workout
    await this.workoutRepository.remove(workoutId, coachFilterConditions);
  }
}
