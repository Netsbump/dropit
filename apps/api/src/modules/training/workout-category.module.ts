import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { WorkoutCategoryController } from './interface/controllers/workout-category.controller';
import { WorkoutCategory } from './domain/workout-category.entity';
import { WorkoutCategoryUseCase } from './application/use-cases/workout-category.use-cases';
import { MikroWorkoutCategoryRepository } from './infrastructure/mikro-workout-category.repository';
import { WORKOUT_CATEGORY_REPO } from './application/ports/workout-category.repository';
import { OrganizationModule } from '../identity/organization/organization.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([WorkoutCategory]),
    OrganizationModule,
  ],
  controllers: [WorkoutCategoryController],
  providers: [
    // implementations MikroORM
    MikroWorkoutCategoryRepository,

    // use-cases
    WorkoutCategoryUseCase,

    // liaisons port -> implementation
    { provide: WORKOUT_CATEGORY_REPO, useClass: MikroWorkoutCategoryRepository },
  ],
  exports: [WORKOUT_CATEGORY_REPO],
})
export class WorkoutCategoryModule {}
