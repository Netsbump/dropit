import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Athlete } from "../../domain/athlete.entity";
import { CreateAthlete, UpdateAthlete } from "@dropit/schemas";
import { AthletePresenter } from "../../interface/presenter/athlete.presenter";
import { OrganizationService } from "../../../identity/organization/organization.service";
import { UserService } from "../../../identity/auth/user.service";
import { ATHLETE_REPO, IAthleteRepository } from "../ports/athlete.repository";
import { AthleteMapper } from "../../interface/mappers/athlete.mapper";

@Injectable()
export class AthleteUseCases {
  constructor(
    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService
  ) {}

  async findOne(athleteId: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get athlete to verify it exists and get its userId
      const athlete = await this.athleteRepository.getOne(athleteId);

      if (!athlete || !athlete.user) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }

      // 2. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own athlete or the athlete of an athlete you are coaching"
        );
      }

      // 3. Check if athleteId is in organization
      await this.organizationService.checkAthleteBelongsToOrganization(athlete.user.id, organizationId);

      const athleteDto = AthleteMapper.toDto(athlete);

      return AthletePresenter.presentOne(athleteDto);
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }

  async findOneWithDetails(athleteId: string, currentUserId: string, organizationId: string) {
    try {
      // 1. Get athlete to verify it exists and get its userId
      const athlete = await this.athleteRepository.getOne(athleteId);
      if (!athlete) {
        throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
      }

      // 2. Validate user access
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      if (!isUserCoach && currentUserId !== athlete.user.id) {
        throw new NotFoundException(
          "Access denied. You can only access your own athlete or the athlete of an athlete you are coaching"
        );
      }

      // 3. Check if athleteId is in organization
      await this.organizationService.checkAthleteBelongsToOrganization(athlete.user.id, organizationId);

      // 4. Get athlete with details from repository
      const athleteWithDetails = await this.athleteRepository.findOneWithDetails(athlete.user.id);

      if (!athleteWithDetails) {
        throw new NotFoundException('Athlete not found');
      }

      const athleteDetailsDto = AthleteMapper.toDtoDetails(athleteWithDetails);

      return AthletePresenter.presentOneDetails(athleteDetailsDto);
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }

  async findAllWithDetails(currentUserId: string, organizationId: string) {
    try {
      // 1. Verify user belongs to the organization (either as coach or athlete)
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      const athleteUserIds = await this.organizationService.getAthleteUserIds(organizationId);
      const isUserAthlete = athleteUserIds.includes(currentUserId);
      
      if (!isUserCoach && !isUserAthlete) {
        throw new NotFoundException('User does not belong to this organization');
      }

      // 2. Get athletes from repository
      const athletes = await this.athleteRepository.findAllWithDetails(athleteUserIds);
      if (!athletes) {
        throw new NotFoundException('Athletes not found');
      }
      
      // 3. Map to DTO
      const athletesDto = AthleteMapper.toDtoListDetails(athletes);

      // 4. Present athletes
      return AthletePresenter.presentListDetails(athletesDto);
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }

  async findAll(currentUserId: string, organizationId: string) {
    try {
      // 1. Verify user belongs to the organization (either as coach or athlete)
      const isUserCoach = await this.organizationService.isUserCoach(currentUserId, organizationId);
      const athleteUserIds = await this.organizationService.getAthleteUserIds(organizationId);
      const isUserAthlete = athleteUserIds.includes(currentUserId);
      
      if (!isUserCoach && !isUserAthlete) {
        throw new NotFoundException('User does not belong to this organization');
      }

      // 2. Get athletes from repository
      const athletes = await this.athleteRepository.getAll(athleteUserIds);
      if (!athletes) {
        throw new NotFoundException('Athletes not found');
      }
      
      // 3. Map to DTO
      const athletesDto = AthleteMapper.toDtoList(athletes);

      // 4. Present athletes
      return AthletePresenter.presentList(athletesDto);
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }

  async create(data: CreateAthlete, userId: string) {
    try {
      //1. Get User from repository
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. Check if User already has an athlete profile
      const existingAthlete = await this.athleteRepository.getOne(userId);
      if (existingAthlete) {
        throw new BadRequestException('User already has an athlete profile');
      }

      //3. Create Athlete
      const athlete = new Athlete();
      athlete.firstName = data.firstName;
      athlete.lastName = data.lastName;
      athlete.birthday = new Date(data.birthday);
      if (data.country) {
        athlete.country = data.country;
      }
      athlete.user = user;

      //4. Save Athlete
      await this.athleteRepository.save(athlete);

      //5. Map to DTO
      const athleteDto = AthleteMapper.toDto(athlete);

      //6. Present Athlete
      return AthletePresenter.presentOne(athleteDto);
    } catch (error) {
      return AthletePresenter.presentCreationError(error as Error);
    }
  }

  async update(idAthlete: string, data: UpdateAthlete, userId: string) {
    try {
      //1. Get Athlete
      const athlete = await this.athleteRepository.getOne(idAthlete);

      if (!athlete) {
        throw new NotFoundException('Athlete not found');
      }

      //2. Check if Athlete has a user  
      if (!athlete.user) {
        throw new NotFoundException('Athlete has no user');
      }

      //3. Check if Athlete belongs to User
      if (athlete.user.id !== userId) {
        throw new ForbiddenException('Athlete does not belong to User');
      }

      //4. Update Athlete
      if (data.firstName !== undefined) {
        athlete.firstName = data.firstName;
      }

      if (data.lastName !== undefined) {
        athlete.lastName = data.lastName;
      }

      if (data.birthday !== undefined) {
        athlete.birthday = new Date(data.birthday);
      }

      if (data.country !== undefined) {
        athlete.country = data.country;
      }

      //5. Save Athlete
      await this.athleteRepository.save(athlete);

      //6. Map to DTO
      const athleteDto = AthleteMapper.toDto(athlete);

      //7. Present Athlete
      return AthletePresenter.presentOne(athleteDto);
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }

  async delete(idAthlete: string, userId: string) {
    try {
      //1. Get Athlete
      const athlete = await this.athleteRepository.getOne(idAthlete);

      if (!athlete) {
        throw new NotFoundException('Athlete not found');
      }

      //2. Check if Athlete has a user  
      if (!athlete.user) {
        throw new NotFoundException('Athlete has no user');
      }

      //3. Check if Athlete belongs to User
      if (athlete.user.id !== userId) {
        throw new ForbiddenException('Athlete does not belong to User');
      }

      //4. Delete Athlete
      await this.athleteRepository.remove(athlete);

      //5. Present Athlete
      return AthletePresenter.presentSuccess('Athlete deleted successfully');
    } catch (error) {
      return AthletePresenter.presentError(error as Error);
    }
  }
}