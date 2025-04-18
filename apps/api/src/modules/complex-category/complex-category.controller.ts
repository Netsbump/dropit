import { complexCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ComplexCategoryService } from './complex-category.service';

const c = complexCategoryContract;

@Controller()
export class ComplexCategoryController {
  constructor(
    private readonly complexCategoryService: ComplexCategoryService
  ) {}

  @TsRestHandler(c.getComplexCategories)
  async getComplexCategories() {
    return tsRestHandler(c.getComplexCategories, async () => {
      try {
        const complexCategory =
          await this.complexCategoryService.getComplexCategories();
        return {
          status: 200,
          body: complexCategory,
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

  @TsRestHandler(c.getComplexCategory)
  async getComplexCategory() {
    return tsRestHandler(c.getComplexCategory, async ({ params }) => {
      try {
        const complexCategory =
          await this.complexCategoryService.getComplexCategory(params.id);
        return {
          status: 200,
          body: complexCategory,
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

  @TsRestHandler(c.createComplexCategory)
  async createComplexCategory() {
    return tsRestHandler(c.createComplexCategory, async ({ body }) => {
      try {
        const complexCategory =
          await this.complexCategoryService.createComplexCategory(body);
        return {
          status: 201,
          body: complexCategory,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: {
              message: error.message,
            },
          };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.updateComplexCategory)
  async updateComplexCategory() {
    return tsRestHandler(c.updateComplexCategory, async ({ params, body }) => {
      try {
        const complexCategory =
          await this.complexCategoryService.updateComplexCategory(
            params.id,
            body
          );
        return {
          status: 200,
          body: complexCategory,
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

  @TsRestHandler(c.deleteComplexCategory)
  async deleteComplexCategory() {
    return tsRestHandler(c.deleteComplexCategory, async ({ params }) => {
      try {
        await this.complexCategoryService.deleteComplexCategory(params.id);
        return {
          status: 200,
          body: {
            message: 'Complex category deleted successfully',
          },
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
}
