import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { OrganizationModule } from '../../identity/organization/organization.module';
import { ComplexCategory } from '../complex-category/complex-category.entity';
import { ComplexCategoryModule } from '../complex-category/complex-category.module';
import { ExerciseCategoryModule } from '../exercise-category/exercise-category.module';
import { ExerciseComplex } from '../exercise-complex/exercise-complex.entity';
import { Exercise } from '../exercise/exercise.entity';
import { ExerciseModule } from '../exercise/exercise.module';
import { ComplexController } from './complex.controller';
import { Complex } from './complex.entity';
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
    OrganizationModule,
  ],
  controllers: [ComplexController],
  providers: [ComplexService],
})
export class ComplexModule {}
