import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingSessionPresenter } from '../interface/training-session.presenter';
import { TrainingSessionRepository } from '../application/training-session.repository';
import { OrganizationService } from '../../../members/organization/organization.service';
import { TrainingSessionMapper } from '../interface/training-session.mapper';
import { CreateTrainingSession } from '@dropit/schemas';
import { WorkoutService } from '../../../training/workout/workout.service';
import { AthleteService } from '../../../members/athlete/athlete.service';
import { UserService } from '../../../members/auth/user.service';

@Injectable()
export class TrainingSessionUseCase {
  constructor(
    private readonly trainingSessionRepository: TrainingSessionRepository,
    private readonly trainingSessionPresenter: TrainingSessionPresenter,
    private readonly organizationService: OrganizationService,
    private readonly workoutService: WorkoutService,
    private readonly athleteService: AthleteService,
    private readonly userService: UserService
  ) {}

  async getOne(id: string, organizationId: string) {
    try {

      //1. Validate organization
      const organization = await this.organizationService.getOrganizationById(organizationId);

      //2. Get session from repository
      const session = await this.trainingSessionRepository.getOneWithDetails(id, organization.id);

      //3. Validate session
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      //4. Map session to DTO
      const sessionDto = TrainingSessionMapper.toDto(session);

      //5. Present session
      return this.trainingSessionPresenter.presentOne(sessionDto);
    } catch (error) {
      return this.trainingSessionPresenter.presentError(error as Error);
    }
  }

  async getAll(organizationId: string) {
    try {

      //1. Validate organization
      const organization = await this.organizationService.getOrganizationById(organizationId);

      //2. Get sessions from repository
      const sessions = await this.trainingSessionRepository.getAllWithDetails(organization.id);

      //3. Validate sessions
      if (!sessions) {
        throw new NotFoundException('Sessions not found');
      }

      //4. Map sessions to DTO
      const sessionsDto = TrainingSessionMapper.toDtoList(sessions);

      //5. Present sessions
      return this.trainingSessionPresenter.present(sessionsDto);
    } catch (error) {
      return this.trainingSessionPresenter.presentError(error as Error);
    }
  }

  async createOne(data: CreateTrainingSession, organizationId: string, userId: string) {
    try {

      //1. Check if User exists 
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      //2. Check if Organization exists
      const organization = await this.organizationService.getOrganizationById(organizationId);

      //3. Check if the user is admin of this organization
      const isAdmin = await this.organizationService.isUserCoach(userId, organizationId);

      if (!isAdmin) {
        throw new ForbiddenException('User is not admin of this organization');
      }

      //4. Check if workout exists
      const workout = await this.workoutService.getWorkout(data.workoutId, organization.id);

      //5. Should I need to check if the workout is attached to this coach or is it already attached when i get the workout?

      if (!workout) {
        throw new NotFoundException(
          `Workout with ID ${data.workoutId} not found`
        );
      }

      //6. Check if athletes exist and belong to this organization
      for (const athleteId of data.athleteIds) {
        const athlete = await this.athleteService.getAthleteById(athleteId);

        if (!athlete) {
          throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
        }

        if (athlete.organization.id !== organization.id) {
          throw new ForbiddenException('Athlete does not belong to this organization');
        }
      }

      //7. Create session

    }
  }
}
