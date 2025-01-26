import { Module } from '@nestjs/common';
import { WorkoutCategoryController } from './workout-category.controller';
import { WorkoutCategoryService } from './workout-category.service';

@Module({
  controllers: [WorkoutCategoryController],
  providers: [WorkoutCategoryService],
})
export class WorkoutCategoryModule {}
