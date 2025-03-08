import { AthleteDto, CreateAthlete, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';

@Injectable()
export class AthleteService {
  constructor(private readonly em: EntityManager) {}

  async getAthletes(): Promise<AthleteDto[]> {
    const athletes = await this.em.find(Athlete, {});
    return athletes.map((athlete) => this.mapToDto(athlete));
  }

  async getAthlete(id: string): Promise<AthleteDto> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    return this.mapToDto(athlete);
  }

  async createAthlete(athlete: CreateAthlete): Promise<AthleteDto> {
    const athleteToCreate = new Athlete();
    athleteToCreate.name = athlete.name;
    if (athlete.email) {
      athleteToCreate.email = athlete.email;
    }

    await this.em.persistAndFlush(athleteToCreate);
    return this.mapToDto(athleteToCreate);
  }

  async updateAthlete(id: string, athlete: UpdateAthlete): Promise<AthleteDto> {
    const athleteToUpdate = await this.em.findOne(Athlete, { id });
    if (!athleteToUpdate) {
      throw new NotFoundException('Athlete not found');
    }

    if (athlete.name) {
      athleteToUpdate.name = athlete.name;
    }

    if (athlete.email !== undefined) {
      athleteToUpdate.email = athlete.email;
    }

    await this.em.persistAndFlush(athleteToUpdate);
    return this.mapToDto(athleteToUpdate);
  }

  async deleteAthlete(id: string): Promise<void> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    await this.em.removeAndFlush(athlete);
  }

  private mapToDto(athlete: Athlete): AthleteDto {
    return {
      id: athlete.id,
      name: athlete.name,
      email: athlete.email,
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
    };
  }
}
