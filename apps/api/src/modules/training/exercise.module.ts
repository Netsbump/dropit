import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from './domain/exercise-category.entity';
import { ExerciseCategoryModule } from './exercise-category.module';
import { ExerciseController } from './interface/controllers/exercise.controller';
import { Exercise } from './domain/exercise.entity';
import { ExerciseUseCase } from './application/use-cases/exercise.use-cases';
import { MikroExerciseRepository } from './infrastructure/mikro-exercise.repository';
import { EXERCISE_REPO } from './application/ports/exercise.repository';
import { OrganizationModule } from '../identity/organization/organization.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Exercise, ExerciseCategory]),
    ExerciseCategoryModule,
    OrganizationModule,
  ],
  controllers: [ExerciseController],
  providers: [
    // implementations MikroORM
    MikroExerciseRepository,

    // use-cases
    ExerciseUseCase,

    // liaisons port -> implementation
    { provide: EXERCISE_REPO, useClass: MikroExerciseRepository },
  ],
  exports: [EXERCISE_REPO],
})
export class ExerciseModule {}
