import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import {
  Complex,
  ComplexCategory,
  Exercise,
  ExerciseComplex,
} from '../../entities';
import { ComplexCategoryModule } from '../complex-category/complex-category.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ExerciseCategoryModule } from '../exerciseCategory/exerciseCategory.module';
import { ComplexController } from './complex.controller';
import { ComplexService } from './complex.service';
@Module({
  imports: [
    MikroOrmModule.forFeature([
      Complex,
      ComplexCategory,
      ExerciseComplex,
      Exercise,
    ]),
    forwardRef(() => ExerciseModule),
    forwardRef(() => ExerciseCategoryModule),
    forwardRef(() => ComplexCategoryModule),
  ],
  controllers: [ComplexController],
  providers: [ComplexService],
})
export class ComplexModule {}
