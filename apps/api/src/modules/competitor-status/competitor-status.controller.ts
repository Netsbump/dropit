import { competitorStatusContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { CompetitorStatusService } from './competitor-status.service';

const c = competitorStatusContract;

@Controller()
export class CompetitorStatusController {
  constructor(
    private readonly competitorStatusService: CompetitorStatusService
  ) {}

  @TsRestHandler(c.getCompetitorStatuses)
  async getCompetitorStatuses() {
    return tsRestHandler(c.getCompetitorStatuses, async () => {
      try {
        const competitorStatuses =
          await this.competitorStatusService.getCompetitorStatuses();

        return {
          status: 200,
          body: competitorStatuses,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: {
              message: error.message,
            },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.getCompetitorStatus)
  async getCompetitorStatus() {
    return tsRestHandler(c.getCompetitorStatus, async ({ params }) => {
      try {
        const competitorStatus =
          await this.competitorStatusService.getCompetitorStatus(params.id);

        return {
          status: 200,
          body: competitorStatus,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.createCompetitorStatus)
  async createCompetitorStatus() {
    return tsRestHandler(c.createCompetitorStatus, async ({ body }) => {
      try {
        const newCompetitorStatus =
          await this.competitorStatusService.createCompetitorStatus(body);
        return {
          status: 201,
          body: newCompetitorStatus,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: { message: error.message },
          };
        }
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.updateCompetitorStatus)
  async updateCompetitorStatus() {
    return tsRestHandler(c.updateCompetitorStatus, async ({ params, body }) => {
      try {
        const updatedCompetitorStatus =
          await this.competitorStatusService.updateCompetitorStatus(
            params.id,
            body
          );

        return {
          status: 200,
          body: updatedCompetitorStatus,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }
}
