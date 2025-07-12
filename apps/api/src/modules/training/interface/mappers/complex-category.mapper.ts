import { ComplexCategoryDto } from '@dropit/schemas';
import { ComplexCategory } from '../../domain/complex-category.entity';

export const ComplexCategoryMapper = {
  toDto(complexCategory: ComplexCategory): ComplexCategoryDto {
    return {
      id: complexCategory.id,
      name: complexCategory.name,
    };
  },

  toDtoList(complexCategories: ComplexCategory[]): ComplexCategoryDto[] {
    return complexCategories.map((complexCategory) => ComplexCategoryMapper.toDto(complexCategory));
  },
}; 