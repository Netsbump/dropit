import { personalRecordContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PersonalRecordService } from './personal-record.service';

const c = personalRecordContract;

@Controller()
export class PersonalRecordController {
  constructor(private readonly personalRecordService: PersonalRecordService) {}

  @TsRestHandler(c.getPersonalRecords)
  getPersonalRecords(): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecords>> {
    return tsRestHandler(c.getPersonalRecords, async () => {
      try {
        const personalRecords =
          await this.personalRecordService.getPersonalRecords();

        return {
          status: 200,
          body: personalRecords,
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            status: 500,
            body: { message: error.message },
          };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getPersonalRecord)
  getPersonalRecord(): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecord>> {
    return tsRestHandler(c.getPersonalRecord, async ({ params }) => {
      try {
        const personalRecord =
          await this.personalRecordService.getPersonalRecord(params.id);

        return {
          status: 200,
          body: personalRecord,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        if (error instanceof Error) {
          return {
            status: 500,
            body: { message: error.message },
          };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthletePersonalRecords)
  getAthletePersonalRecords(): ReturnType<typeof tsRestHandler<typeof c.getAthletePersonalRecords>> {
    return tsRestHandler(c.getAthletePersonalRecords, async ({ params }) => {
      try {
        const personalRecords =
          await this.personalRecordService.getAthletePersonalRecords(params.id);

        return {
          status: 200,
          body: personalRecords,
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

  @TsRestHandler(c.getAthletePersonalRecordsSummary)
  getAthletePersonalRecordsSummary(): ReturnType<typeof tsRestHandler<typeof c.getAthletePersonalRecordsSummary>> {
    return tsRestHandler(
      c.getAthletePersonalRecordsSummary,
      async ({ params }) => {
        try {
          const summary =
            await this.personalRecordService.getAthletePersonalRecordsSummary(
              params.id
            );

          return {
            status: 200,
            body: summary,
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
      }
    );
  }

  @TsRestHandler(c.createPersonalRecord)
  createPersonalRecord(): ReturnType<typeof tsRestHandler<typeof c.createPersonalRecord>> {
    return tsRestHandler(c.createPersonalRecord, async ({ body }) => {
      try {
        const newPersonalRecord =
          await this.personalRecordService.createPersonalRecord(body);
        return {
          status: 201,
          body: newPersonalRecord,
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

  @TsRestHandler(c.updatePersonalRecord)
  updatePersonalRecord(): ReturnType<typeof tsRestHandler<typeof c.updatePersonalRecord>> {
    return tsRestHandler(c.updatePersonalRecord, async ({ params, body }) => {
      try {
        const updatedPersonalRecord =
          await this.personalRecordService.updatePersonalRecord(
            params.id,
            body
          );

        return {
          status: 200,
          body: updatedPersonalRecord,
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

  @TsRestHandler(c.deletePersonalRecord)
  deletePersonalRecord(): ReturnType<typeof tsRestHandler<typeof c.deletePersonalRecord>> {
    return tsRestHandler(c.deletePersonalRecord, async ({ params }) => {
      try {
        await this.personalRecordService.deletePersonalRecord(params.id);

        return {
          status: 204,
          body: null,
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
