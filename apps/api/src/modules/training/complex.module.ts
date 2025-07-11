import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { OrganizationModule } from '../identity/organization/organization.module';
import { ComplexCategory } from './domain/complex-category.entity';
import { ComplexCategoryModule } from './complex-category.module';
import { ExerciseCategoryModule } from './exercise-category.module';
import { ExerciseComplex } from './domain/exercise-complex.entity';
import { Exercise } from './domain/exercise.entity';
import { ExerciseModule } from './exercise.module';
import { ComplexController } from './interface/controllers/complex.controller';
import { Complex } from './domain/complex.entity';
import { ComplexUseCase } from './application/use-cases/complex.use-cases';
import { MikroComplexRepository } from './infrastructure/mikro-complex.repository';
import { COMPLEX_REPO } from './application/ports/complex.repository';

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
  providers: [
    // implementations MikroORM
    MikroComplexRepository,

    // use-cases
    ComplexUseCase,

    // liaisons port -> implementation
    { provide: COMPLEX_REPO, useClass: MikroComplexRepository },
  ],
  exports: [COMPLEX_REPO],
})
export class ComplexModule {}
