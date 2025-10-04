import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Athlete } from "../../domain/athlete.entity";
import { CreateAthlete, UpdateAthlete } from "@dropit/schemas";
import { UserUseCases } from "../../../identity/application/user.use-cases";
import { MemberUseCases } from "../../../identity/application/member.use-cases";
import { ATHLETE_REPO, AthleteDetails, IAthleteRepository } from "../ports/athlete.repository";

@Injectable()
export class AthleteUseCases {
  constructor(
    @Inject(ATHLETE_REPO)
    private readonly athleteRepository: IAthleteRepository,
    private readonly userUseCases: UserUseCases,
    private readonly memberUseCases: MemberUseCases
  ) {}

  async findOne(athleteId: string, currentUserId: string, organizationId: string): Promise<Athlete> {
    // 1. Get athlete to verify it exists and get its userId
    const athlete = await this.athleteRepository.getOne(athleteId);

    if (!athlete || !athlete.user) {
      throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // 2. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new NotFoundException(
        "Access denied. You can only access your own athlete or the athlete of an athlete you are coaching"
      );
    }

    // 3. Check if athleteId is in organization
    await this.memberUseCases.isUserAthleteInOrganization(athlete.user.id, organizationId);

    return athlete;
  }

  async findOneWithDetails(athleteId: string, currentUserId: string, organizationId: string): Promise<AthleteDetails> {
    // 1. Get athlete to verify it exists and get its userId
    const athlete = await this.athleteRepository.getOne(athleteId);
    if (!athlete) {
      throw new NotFoundException(`Athlete with ID ${athleteId} not found`);
    }

    // 2. Validate user access
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    if (!isUserCoach && currentUserId !== athlete.user.id) {
      throw new NotFoundException(
        "Access denied. You can only access your own athlete or the athlete of an athlete you are coaching"
      );
    }

    // 3. Check if athleteId is in organization
    await this.memberUseCases.isUserAthleteInOrganization(athlete.user.id, organizationId);

    // 4. Get athlete with details from repository
    const athleteWithDetails = await this.athleteRepository.findOneWithDetails(athlete.user.id);

    if (!athleteWithDetails) {
      throw new NotFoundException('Athlete not found');
    }

    return athleteWithDetails;
  }

  async findAllWithDetails(currentUserId: string, organizationId: string): Promise<AthleteDetails[]> {
    // 1. Verify user belongs to the organization (either as coach or athlete)
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    const athleteUserIds = await this.memberUseCases.getAthleteUserIds(organizationId);
    const isUserAthlete = athleteUserIds.includes(currentUserId);

    if (!isUserCoach && !isUserAthlete) {
      throw new NotFoundException('User does not belong to this organization');
    }

    // 2. Get athletes from repository
    const athletes = await this.athleteRepository.findAllWithDetails(athleteUserIds);
    if (!athletes) {
      throw new NotFoundException('Athletes not found');
    }

    return athletes;
  }

  async findAll(currentUserId: string, organizationId: string): Promise<Athlete[]> {
    // 1. Verify user belongs to the organization (either as coach or athlete)
    const isUserCoach = await this.memberUseCases.isUserCoachInOrganization(currentUserId, organizationId);
    const athleteUserIds = await this.memberUseCases.getAthleteUserIds(organizationId);
    const isUserAthlete = athleteUserIds.includes(currentUserId);

    if (!isUserCoach && !isUserAthlete) {
      throw new NotFoundException('User does not belong to this organization');
    }

    // 2. Get athletes from repository
    const athletes = await this.athleteRepository.getAll(athleteUserIds);
    if (!athletes) {
      throw new NotFoundException('Athletes not found');
    }

    return athletes;
  }

  async create(data: CreateAthlete, userId: string): Promise<Athlete> {
    //1. Get User from repository
    const user = await this.userUseCases.getOne(userId);

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

    return athlete;
  }

  async update(idAthlete: string, data: UpdateAthlete, userId: string): Promise<Athlete> {
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

    return athlete;
  }

  async delete(idAthlete: string, userId: string): Promise<void> {
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
  }
}