import { complexContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexService } from './complex.service';

const c = complexContract;

@Controller()
export class ComplexController {
  constructor(private readonly complexService: ComplexService) {}

  @TsRestHandler(c.getComplexes)
  getComplexes(): ReturnType<typeof tsRestHandler<typeof c.getComplexes>> {
    return tsRestHandler(c.getComplexes, async () => {
      try {
        const complexes = await this.complexService.getComplexes();

        return {
          status: 200,
          body: complexes,
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

  @TsRestHandler(c.getComplex)
  getComplex(): ReturnType<typeof tsRestHandler<typeof c.getComplex>> {
    return tsRestHandler(c.getComplex, async ({ params }) => {
      try {
        const complex = await this.complexService.getComplex(params.id);
        return {
          status: 200,
          body: complex,
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

  @TsRestHandler(c.createComplex)
  createComplex(): ReturnType<typeof tsRestHandler<typeof c.createComplex>> {
    return tsRestHandler(c.createComplex, async ({ body }) => {
      try {
        const newComplex = await this.complexService.createComplex(body);
        return {
          status: 201,
          body: newComplex,
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

  @TsRestHandler(c.updateComplex)
  updateComplex(): ReturnType<typeof tsRestHandler<typeof c.updateComplex>> {
    return tsRestHandler(c.updateComplex, async ({ params, body }) => {
      try {
        const updatedComplex = await this.complexService.updateComplex(
          params.id,
          body
        );
        return {
          status: 200,
          body: updatedComplex,
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
