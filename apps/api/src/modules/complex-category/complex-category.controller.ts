import { complexCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { ComplexCategoryService } from './complex-category.service';

const c = nestControllerContract(complexCategoryContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class ComplexCategoryController
  implements NestControllerInterface<typeof c>
{
  constructor(
    private readonly complexCategoryService: ComplexCategoryService
  ) {}

  @TsRest(c.getComplexCategories)
  async getComplexCategories(
    @TsRestRequest() request: RequestShapes['getComplexCategories']
  ) {
    try {
      const complexCategory =
        await this.complexCategoryService.getComplexCategories();
      return {
        status: 200 as const,
        body: complexCategory,
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

  @TsRest(c.getComplexCategory)
  async getComplexCategory(
    @TsRestRequest()
    { params }: RequestShapes['getComplexCategory']
  ) {
    try {
      const complexCategory =
        await this.complexCategoryService.getComplexCategory(params.id);
      return {
        status: 200 as const,
        body: complexCategory,
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

  @TsRest(c.createComplexCategory)
  async createComplexCategory(
    @TsRestRequest() { body }: RequestShapes['createComplexCategory']
  ) {
    try {
      const complexCategory =
        await this.complexCategoryService.createComplexCategory(body);
      return {
        status: 201 as const,
        body: complexCategory,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 400 as const,
          body: {
            message: error.message,
          },
        };
      }
      throw error;
    }
  }

  @TsRest(c.updateComplexCategory)
  async updateComplexCategory(
    @TsRestRequest()
    { params, body }: RequestShapes['updateComplexCategory']
  ) {
    try {
      const complexCategory =
        await this.complexCategoryService.updateComplexCategory(
          params.id,
          body
        );
      return {
        status: 200 as const,
        body: complexCategory,
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

  @TsRest(c.deleteComplexCategory)
  async deleteComplexCategory(
    @TsRestRequest()
    { params }: RequestShapes['deleteComplexCategory']
  ) {
    try {
      await this.complexCategoryService.deleteComplexCategory(params.id);
      return {
        status: 200 as const,
        body: {
          message: 'Complex category deleted successfully',
        },
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
}
