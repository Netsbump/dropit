import { complexContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestHandler,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { ComplexService } from './complex.service';

const c = nestControllerContract(complexContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class ComplexController implements NestControllerInterface<typeof c> {
  constructor(private readonly complexService: ComplexService) {}

  @TsRest(c.getComplexes)
  async getComplexes(@TsRestRequest() request: RequestShapes['getComplexes']) {
    try {
      const complexes = await this.complexService.getComplexes();

      return {
        status: 200 as const,
        body: complexes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: {
            message: error.message,
          },
        };
      }

      throw error;
    }
  }

  @TsRest(c.getComplex)
  async getComplex(@TsRestRequest() { params }: RequestShapes['getComplex']) {
    try {
      const complex = await this.complexService.getComplex(params.id);
      return {
        status: 200 as const,
        body: complex,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: {
            message: error.message,
          },
        };
      }

      throw error;
    }
  }

  @TsRest(c.createComplex)
  async createComplex(
    @TsRestRequest() { body }: RequestShapes['createComplex']
  ) {
    try {
      const newComplex = await this.complexService.createComplex(body);
      return {
        status: 201 as const,
        body: newComplex,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 400 as const,
          body: { message: error.message },
        };
      }
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }

      throw error;
    }
  }

  @TsRest(c.updateComplex)
  async updateComplex(
    @TsRestRequest() { params, body }: RequestShapes['updateComplex']
  ) {
    try {
      const updatedComplex = await this.complexService.updateComplex(
        params.id,
        body
      );
      return {
        status: 200 as const,
        body: updatedComplex,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }

      throw error;
    }
  }
}
