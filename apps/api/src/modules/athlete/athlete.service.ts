import { AthleteDto, CreateAthlete, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { Club } from '../../entities/club.entity';
import { User } from '../../entities/user.entity';

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

  async createAthlete(data: CreateAthlete): Promise<AthleteDto> {
    const athlete = new Athlete();
    athlete.firstName = data.firstName;
    athlete.lastName = data.lastName;
    athlete.birthday = new Date(data.birthday);

    if (data.country) {
      athlete.country = data.country;
    }

    if (data.clubId) {
      const club = await this.em.findOne(Club, { id: data.clubId });
      if (club) {
        athlete.club = club;
      }
    }

    if (data.userId) {
      const user = await this.em.findOne(User, { id: data.userId });
      if (user) {
        athlete.user = user;
      }
    }

    await this.em.persistAndFlush(athlete);
    return this.mapToDto(athlete);
  }

  async updateAthlete(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const athlete = await this.em.findOne(Athlete, { id });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

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

    if (data.clubId !== undefined) {
      if (data.clubId) {
        const club = await this.em.findOne(Club, { id: data.clubId });
        if (club) {
          athlete.club = club;
        }
      }
    }

    if (data.userId !== undefined) {
      if (data.userId) {
        const user = await this.em.findOne(User, { id: data.userId });
        if (user) {
          athlete.user = user;
        }
      }
    }

    await this.em.persistAndFlush(athlete);
    return this.mapToDto(athlete);
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
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: athlete.birthday,
      country: athlete.country,
      clubId: athlete.club?.id,
      userId: athlete.user?.id,
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
    };
  }
}
