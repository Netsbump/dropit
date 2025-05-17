import {
  ComplexCategoryDto,
  CreateComplexCategory,
  UpdateComplexCategory,
} from '@dropit/schemas';
import { EntityManager, wrap } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplexCategory } from './complex-category.entity';

@Injectable()
export class ComplexCategoryService {
  constructor(private readonly em: EntityManager) {}

  async getComplexCategories(): Promise<ComplexCategoryDto[]> {
    const complexCategories = await this.em.find(ComplexCategory, {});

    return complexCategories.map((complexCategory) => ({
      id: complexCategory.id,
      name: complexCategory.name,
    }));
  }

  async getComplexCategory(id: string): Promise<ComplexCategoryDto> {
    const complexCategory = await this.em.findOne(ComplexCategory, { id });

    if (!complexCategory) {
      throw new NotFoundException(`Complex category with ID ${id} not found`);
    }

    return {
      id: complexCategory.id,
      name: complexCategory.name,
    };
  }

  async createComplexCategory(
    newComplexCategory: CreateComplexCategory
  ): Promise<ComplexCategoryDto> {
    if (!newComplexCategory.name) {
      throw new BadRequestException('Complex category name is required');
    }

    const complexCategory = new ComplexCategory();
    complexCategory.name = newComplexCategory.name;
    await this.em.persistAndFlush(complexCategory);

    const complexCategoryCreated = await this.em.findOne(ComplexCategory, {
      id: complexCategory.id,
    });

    if (!complexCategoryCreated) {
      throw new NotFoundException(
        `Complex category with ID ${complexCategory.id} not found`
      );
    }

    return {
      id: complexCategoryCreated.id,
      name: complexCategoryCreated.name,
    };
  }

  async updateComplexCategory(
    id: string,
    updatedComplexCategory: UpdateComplexCategory
  ): Promise<ComplexCategoryDto> {
    const complexCategory = await this.em.findOne(ComplexCategory, { id });

    if (!complexCategory) {
      throw new NotFoundException(`Complex category with ID ${id} not found`);
    }

    wrap(complexCategory).assign(updatedComplexCategory, {
      mergeObjectProperties: true,
    });

    await this.em.persistAndFlush(complexCategory);

    const complexCategoryUpdated = await this.em.findOne(ComplexCategory, {
      id: complexCategory.id,
    });

    if (!complexCategoryUpdated) {
      throw new NotFoundException(
        `Complex category with ID ${complexCategory.id} not found`
      );
    }

    return {
      id: complexCategoryUpdated.id,
      name: complexCategoryUpdated.name,
    };
  }

  async deleteComplexCategory(id: string): Promise<{ message: string }> {
    const complexCategory = await this.em.findOne(ComplexCategory, { id });

    if (!complexCategory) {
      throw new NotFoundException(`Complex category with ID ${id} not found`);
    }

    await this.em.removeAndFlush(complexCategory);

    return {
      message: 'Complex category deleted successfully',
    };
  }
}
