import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import { CreateAthleteUseCase } from './use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './use-cases/update-athlete.use-case';

const c = apiContract.athlete;

@Controller()
export class AthleteController {
  constructor(
    private readonly getAthletesUseCase: GetAthletesUseCase,
    private readonly getAthleteUseCase: GetAthleteUseCase,
    private readonly createAthleteUseCase: CreateAthleteUseCase,
    private readonly updateAthleteUseCase: UpdateAthleteUseCase,
    private readonly deleteAthleteUseCase: DeleteAthleteUseCase
  ) {}

  // ──────────────────────────────── GET /athlete
  @TsRestHandler(c.getAthletes)
  getAthletes(): ReturnType<typeof tsRestHandler<typeof c.getAthletes>> {
    return tsRestHandler(c.getAthletes, async () => {
      try {
        const athletes = await this.getAthletesUseCase.execute();
        return { status: 200, body: athletes };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── GET /athlete/:id
  @TsRestHandler(c.getAthlete)
  getAthlete(): ReturnType<typeof tsRestHandler<typeof c.getAthlete>> {
    return tsRestHandler(c.getAthlete, async ({ params }) => {
      try {
        const athlete = await this.getAthleteUseCase.execute(params.id);
        return { status: 200, body: athlete };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── POST /athlete
  @TsRestHandler(c.createAthlete)
  createAthlete(): ReturnType<typeof tsRestHandler<typeof c.createAthlete>> {
    return tsRestHandler(c.createAthlete, async ({ body }) => {
      try {
        const newAthlete = await this.createAthleteUseCase.execute(body);
        return { status: 201, body: newAthlete };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return { status: 400, body: { message: error.message } };
        }
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── PATCH /athlete/:id
  @TsRestHandler(c.updateAthlete)
  updateAthlete(): ReturnType<typeof tsRestHandler<typeof c.updateAthlete>> {
    return tsRestHandler(c.updateAthlete, async ({ params, body }) => {
      try {
        const updated = await this.updateAthleteUseCase.execute(
          params.id,
          body
        );
        return { status: 200, body: updated };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  // ──────────────────────────────── DELETE /athlete/:id
  @TsRestHandler(c.deleteAthlete)
  deleteAthlete(): ReturnType<typeof tsRestHandler<typeof c.deleteAthlete>> {
    return tsRestHandler(c.deleteAthlete, async ({ params }) => {
      try {
        await this.deleteAthleteUseCase.execute(params.id);
        return {
          status: 200,
          body: { message: 'Athlete deleted successfully' },
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }
}
