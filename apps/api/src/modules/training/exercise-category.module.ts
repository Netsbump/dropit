import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from './domain/exercise-category.entity';
import { ExerciseCategoryController } from './interface/controllers/exercise-category.controller';
import { ExerciseCategoryUseCase } from './application/use-cases/exercise-category.use-cases';
import { MikroExerciseCategoryRepository } from './infrastructure/mikro-exercise-category.repository';
import { EXERCISE_CATEGORY_REPO } from './application/ports/exercise-category.repository';
import { OrganizationModule } from '../identity/organization/organization.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ExerciseCategory]),
    OrganizationModule,
  ],
  controllers: [ExerciseCategoryController],
  providers: [
    // implementations MikroORM
    MikroExerciseCategoryRepository,

    // use-cases
    ExerciseCategoryUseCase,

    // liaisons port -> implementation
    { provide: EXERCISE_CATEGORY_REPO, useClass: MikroExerciseCategoryRepository },
  ],
  exports: [EXERCISE_CATEGORY_REPO],
})
export class ExerciseCategoryModule {}