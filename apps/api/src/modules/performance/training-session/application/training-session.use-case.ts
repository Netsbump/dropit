import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingSessionPresenter } from '../interface/training-session.presenter';
import { TrainingSessionRepository } from '../application/training-session.repository';
import { OrganizationService } from '../../../members/organization/organization.service';
import { TrainingSessionMapper } from '../interface/training-session.mapper';
import { CreateTrainingSession } from '@dropit/schemas';
import { WorkoutService } from '../../../training/workout/workout.service';
import { UserService } from '../../../members/auth/user.service';
import { TrainingSession } from '../domain/training-session.entity';
import { AthleteTrainingSession } from '../domain/athlete-training-session.entity';
import { AthleteTrainingSessionRepository } from '../../athlete-training-session/application/athlete-training-session.repository';
import { AthleteReadRepository } from '../../../members/athlete/application/ports/athlete-read.repository';

@Injectable()
export class TrainingSessionUseCase {
  constructor(
    private readonly trainingSessionRepository: TrainingSessionRepository,
    private readonly athleteTrainingSessionRepository: AthleteTrainingSessionRepository,
    private readonly trainingSessionPresenter: TrainingSessionPresenter,
    private readonly organizationService: OrganizationService,
    private readonly workoutService: WorkoutService,
    private readonly userService: UserService,
    private readonly athleteReadRepository: AthleteReadRepository
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

      if (!workout) {
        throw new NotFoundException(
          `Workout with ID ${data.workoutId} not found`
        );
      }

      //5. Get all athletes IDs from organization
      const athleteIds = await this.organizationService.getAthleteUserIds(organizationId);

      //6. Valide all requested athletes belong to this organization
      const invalidAthleteIds = data.athleteIds.filter(athleteId => !athleteIds.includes(athleteId));

      if (invalidAthleteIds.length > 0) {
        throw new BadRequestException(`Athletes with IDs ${invalidAthleteIds.join(', ')} do not belong to this organization`);
      }

      //7. Create training session
      const trainingSession = new TrainingSession();
      trainingSession.workout = workout;
      trainingSession.scheduledDate = new Date(data.scheduledDate);
      trainingSession.organization = organization;

      const createdTrainingSession = await this.trainingSessionRepository.save(trainingSession);


      //8. Create athlete training sessions
      const athletes = await this.athleteReadRepository.getAll(data.athleteIds);

      for (const a of athletes) {
        try {
          const athleteTrainingSession = new AthleteTrainingSession();
          athleteTrainingSession.athlete = a;
          athleteTrainingSession.trainingSession = createdTrainingSession;
          await this.athleteTrainingSessionRepository.save(athleteTrainingSession);
        } catch (error) {
          throw new BadRequestException(`Error creating athlete training session for athlete ${a.id}: ${error}`);
        }
      }

      //9. Map training session to DTO
      const trainingSessionDto = TrainingSessionMapper.toDto(createdTrainingSession);

      //10. Return training session
      return this.trainingSessionPresenter.presentOne(trainingSessionDto);
    } catch (error) {
      return this.trainingSessionPresenter.presentCreationError(error as Error);
    }
  }
}
