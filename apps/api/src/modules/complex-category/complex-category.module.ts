import { Module } from '@nestjs/common';
import { ComplexCategoryController } from './complex-category.controller';
import { ComplexCategoryService } from './complex-category.service';

@Module({
  controllers: [ComplexCategoryController],
  providers: [ComplexCategoryService],
})
export class ComplexCategoryModule {}
