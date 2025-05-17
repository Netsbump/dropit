import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ComplexCategoryController } from './complex-category.controller';
import { ComplexCategory } from './complex-category.entity';
import { ComplexCategoryService } from './complex-category.service';

@Module({
  imports: [MikroOrmModule.forFeature([ComplexCategory])],
  controllers: [ComplexCategoryController],
  providers: [ComplexCategoryService],
})
export class ComplexCategoryModule {}
