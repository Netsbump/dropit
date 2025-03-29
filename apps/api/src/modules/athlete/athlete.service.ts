import { AthleteDto, CreateAthlete, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository } from './athlete.repository';
import { CreateAthleteUseCase } from './use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './use-cases/update-athlete.use-case';

// athlete.service.ts
@Injectable()
export class AthleteService {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async getAthletes(): Promise<AthleteDto[]> {
    const useCase = new GetAthletesUseCase(this.athleteRepository);
    return await useCase.execute();
  }

  async getAthlete(id: string): Promise<AthleteDto> {
    const useCase = new GetAthleteUseCase(this.athleteRepository);
    return await useCase.execute(id);
  }

  async createAthlete(data: CreateAthlete): Promise<AthleteDto> {
    const useCase = new CreateAthleteUseCase(this.athleteRepository, this.em);
    return await useCase.execute(data);
  }

  async updateAthlete(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const useCase = new UpdateAthleteUseCase(this.athleteRepository, this.em);
    return await useCase.execute(id, data);
  }

  async deleteAthlete(id: string): Promise<void> {
    const useCase = new DeleteAthleteUseCase(this.athleteRepository);
    await useCase.execute(id);
  }
}
